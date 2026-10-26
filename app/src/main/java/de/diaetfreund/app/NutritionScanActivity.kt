package de.diaetfreund.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.*
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.exifinterface.media.ExifInterface
import com.googlecode.tesseract.android.TessBaseAPI
import java.io.File
import java.util.concurrent.Executors

/** Local OCR only. Images never cross the WebView bridge or leave the device. */
class NutritionScanActivity: ComponentActivity() {
    private val worker=Executors.newSingleThreadExecutor()
    private lateinit var layout:LinearLayout
    private lateinit var status:TextView
    private lateinit var crop:CropView
    private lateinit var scan:Button
    private var working=false
    private var currentUri:Uri?=null
    private val photoFile get()=File(cacheDir,"nutrition/capture.jpg")
    private val picker=registerForActivityResult(ActivityResultContracts.OpenDocument()){uri->uri?.let{load(it)}}
    private val camera=registerForActivityResult(ActivityResultContracts.TakePicture()){ok->if(ok)load(FileProvider.getUriForFile(this,"$packageName.photos",photoFile))else showMessage("Aufnahme abgebrochen. Du kannst ein anderes Foto wählen.")}
    private val permission=registerForActivityResult(ActivityResultContracts.RequestPermission()){ok->if(ok)takePhoto()else showMessage("Kamera nicht freigegeben. Du kannst stattdessen ein vorhandenes Foto wählen.")}
    override fun onCreate(savedInstanceState:Bundle?) {
        super.onCreate(savedInstanceState)
        layout=LinearLayout(this).apply{orientation=LinearLayout.VERTICAL;setPadding(20,12,20,12);setBackgroundColor(Color.rgb(231,241,249))}
        ViewCompat.setOnApplyWindowInsetsListener(layout){v,insets->val i=insets.getInsets(WindowInsetsCompat.Type.systemBars());v.setPadding(20+i.left,12+i.top,20+i.right,12+i.bottom);insets}
        setContentView(layout)
        status=TextView(this).apply{textSize=17f;setTextColor(Color.rgb(24,45,67));text="Nährwerttabelle fotografieren. Danach nur die Tabelle mit der gewünschten Spalte einrahmen. Foto und Text bleiben auf deinem Gerät."};layout.addView(status)
        val row=LinearLayout(this);layout.addView(row)
        fun button(label:String,parent:LinearLayout=layout,action:()->Unit):Button=Button(this).apply{text=label;isAllCaps=false;setOnClickListener{if(!working)action()};parent.addView(this)}
        button("Kamera",row){if(ContextCompat.checkSelfPermission(this,Manifest.permission.CAMERA)==PackageManager.PERMISSION_GRANTED)takePhoto()else permission.launch(Manifest.permission.CAMERA)}
        button("Foto wählen",row){picker.launch(arrayOf("image/*"))}
        crop=CropView();layout.addView(crop,LinearLayout.LayoutParams(-1,0,1f))
        button("Foto um 90° drehen"){crop.rotate()}
        scan=button("Ausschnitt erkennen"){recognize()};scan.isEnabled=false
        button("Abbrechen"){finish()}
        savedInstanceState?.getString("uri")?.let{load(Uri.parse(it))}
    }
    private fun showMessage(text:String){status.text=text}
    private fun takePhoto(){try{photoFile.parentFile?.mkdirs();camera.launch(FileProvider.getUriForFile(this,"$packageName.photos",photoFile))}catch(_:Exception){showMessage("Kamera nicht verfügbar. Bitte ein vorhandenes Foto wählen.")}}
    private fun load(uri:Uri){
        if(working)return;working=true;scan.isEnabled=false;showMessage("Foto wird vorbereitet …")
        worker.execute{
            try{
                val bitmap=if(Build.VERSION.SDK_INT>=28)ImageDecoder.decodeBitmap(ImageDecoder.createSource(contentResolver,uri)){decoder,info,_->
                    val scale=2048.0/maxOf(info.size.width,info.size.height);if(scale<1)decoder.setTargetSize(maxOf(1,(info.size.width*scale).toInt()),maxOf(1,(info.size.height*scale).toInt()));decoder.allocator=ImageDecoder.ALLOCATOR_SOFTWARE
                }else{
                    val opts=BitmapFactory.Options().apply{inJustDecodeBounds=true};contentResolver.openInputStream(uri).use{BitmapFactory.decodeStream(it,null,opts)}
                    require(opts.outWidth>0&&opts.outHeight>0);var sample=1;while(maxOf(opts.outWidth,opts.outHeight)/sample>2048)sample*=2
                    opts.inJustDecodeBounds=false;opts.inSampleSize=sample;opts.inPreferredConfig=Bitmap.Config.ARGB_8888
                    val b=contentResolver.openInputStream(uri).use{BitmapFactory.decodeStream(it,null,opts)}?:throw IllegalArgumentException()
                    val exif=contentResolver.openInputStream(uri).use{ExifInterface(it!!)}
                    val matrix=Matrix().apply{if(exif.isFlipped)postScale(-1f,1f);postRotate(exif.rotationDegrees.toFloat())}
                    Bitmap.createBitmap(b,0,0,b.width,b.height,matrix,true).also{if(it!==b)b.recycle()}
                }
                runOnUiThread{if(isDestroyed){bitmap.recycle();return@runOnUiThread};currentUri=uri;crop.setPhoto(bitmap);working=false;scan.isEnabled=true;showMessage("Ziehe einen Rahmen um die Nährwerttabelle. Am besten nur eine Zahlenspalte: pro 100 g/ml. Ohne Rahmen wird das ganze Foto gelesen.")}
            }catch(_:Exception){runOnUiThread{working=false;showMessage("Foto konnte nicht geöffnet werden. Bitte ein anderes Bild wählen.")}}
        }
    }
    private fun recognize(){
        val bitmap=crop.selection()?:return;working=true;scan.isEnabled=false;showMessage("Text wird offline erkannt … einen Moment bitte.")
        worker.execute{
            val api=TessBaseAPI()
            try{
                val data=File(filesDir,"nutrition-ocr/tessdata");data.mkdirs();val model=File(data,"deu.traineddata")
                if(!model.exists()||model.length()!=1525436L){val tmp=File(data,"deu.tmp");assets.open("ocr/deu.traineddata").use{input->tmp.outputStream().use{input.copyTo(it)}};check(tmp.renameTo(model))}
                check(api.init(data.parentFile!!.absolutePath,"deu",TessBaseAPI.OEM_LSTM_ONLY))
                api.pageSegMode=TessBaseAPI.PageSegMode.PSM_SINGLE_BLOCK;api.setVariable("preserve_interword_spaces","1");api.setImage(bitmap)
                val text=api.getUTF8Text().orEmpty().take(20000)
                runOnUiThread{if(!isDestroyed){if(text.isBlank()){working=false;scan.isEnabled=true;showMessage("Kein Text erkannt. Bitte näher, scharf und ohne Spiegelung fotografieren.")}else{setResult(RESULT_OK,Intent().putExtra("text",text));finish()}}}
            }catch(_:Exception){runOnUiThread{working=false;scan.isEnabled=true;showMessage("Erkennung fehlgeschlagen. Bitte erneut fotografieren oder manuell erfassen.")}}
            finally{api.recycle();bitmap.recycle()}
        }
    }
    override fun onSaveInstanceState(out:Bundle){out.putString("uri",currentUri?.toString());super.onSaveInstanceState(out)}
    override fun onDestroy(){worker.shutdown();if(isFinishing)photoFile.delete();super.onDestroy()}
    private inner class CropView:View(this@NutritionScanActivity){
        private var bitmap:Bitmap?=null
        private val bounds=RectF();private val box=RectF();private val paint=Paint(Paint.ANTI_ALIAS_FLAG)
        private var sx=0f;private var sy=0f
        init{contentDescription="Fotoausschnitt. Mit dem Finger einen Rahmen ziehen. Ohne Auswahl wird das ganze Bild erkannt."}
        fun setPhoto(b:Bitmap){bitmap?.recycle();bitmap=b;box.setEmpty();invalidate()}
        fun rotate(){val b=bitmap?:return;setPhoto(Bitmap.createBitmap(b,0,0,b.width,b.height,Matrix().apply{postRotate(90f)},true))}
        override fun onDraw(c:Canvas){super.onDraw(c);val b=bitmap?:return;val scale=minOf(width.toFloat()/b.width,height.toFloat()/b.height);bounds.set((width-b.width*scale)/2,(height-b.height*scale)/2,(width+b.width*scale)/2,(height+b.height*scale)/2);paint.color=Color.WHITE;paint.style=Paint.Style.FILL;c.drawBitmap(b,null,bounds,paint);if(!box.isEmpty){paint.color=Color.rgb(236,96,55);paint.style=Paint.Style.STROKE;paint.strokeWidth=5f;c.drawRect(box,paint)}}
        override fun onTouchEvent(e:MotionEvent):Boolean{if(bitmap==null||working)return false;val x=e.x.coerceIn(bounds.left,bounds.right);val y=e.y.coerceIn(bounds.top,bounds.bottom);when(e.action){MotionEvent.ACTION_DOWN->{sx=x;sy=y;box.setEmpty()};MotionEvent.ACTION_MOVE,MotionEvent.ACTION_UP->{box.set(minOf(sx,x),minOf(sy,y),maxOf(sx,x),maxOf(sy,y));if(e.action==MotionEvent.ACTION_UP){if(box.width()<24||box.height()<24)box.setEmpty();performClick()}}};invalidate();return true}
        override fun performClick():Boolean{super.performClick();return true}
        fun selection():Bitmap?{val b=bitmap?:return null;if(box.isEmpty||bounds.isEmpty)return b.copy(Bitmap.Config.ARGB_8888,false);val x=((box.left-bounds.left)/bounds.width()*b.width).toInt().coerceIn(0,b.width-1);val y=((box.top-bounds.top)/bounds.height()*b.height).toInt().coerceIn(0,b.height-1);val w=(box.width()/bounds.width()*b.width).toInt().coerceIn(1,b.width-x);val h=(box.height()/bounds.height()*b.height).toInt().coerceIn(1,b.height-y);return Bitmap.createBitmap(b,x,y,w,h).copy(Bitmap.Config.ARGB_8888,false)}
    }
}
