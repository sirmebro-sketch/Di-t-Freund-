package de.diaetfreund.app;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import androidx.activity.ComponentActivity;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;
import com.journeyapps.barcodescanner.ScanContract;
import com.journeyapps.barcodescanner.ScanOptions;
import org.json.JSONObject;
import android.util.AtomicFile;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/** Only packaged, CSP-protected assets receive the native bridge. No remote navigation. */
public final class MainActivity extends ComponentActivity {
    private static final String ORIGIN = "appassets.androidplatform.net";
    private static final int MAX_BYTES = 10 * 1024 * 1024;
    private WebView web;
    private AtomicFile stateFile;
    private File pendingExport;
    private final ActivityResultLauncher<ScanOptions> scanner = registerForActivityResult(new ScanContract(), result -> {
        if (result.getContents() != null) callback("onBarcode", result.getContents());
    });
    private final ActivityResultLauncher<Intent> exporter = registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), result -> {
        if (result.getResultCode() == RESULT_OK && result.getData() != null && pendingExport.exists()) {
            try (OutputStream out = getContentResolver().openOutputStream(result.getData().getData()); InputStream in = new java.io.FileInputStream(pendingExport)) {
                if (out == null) throw new java.io.IOException("No stream");
                byte[] buffer = new byte[8192]; int read;
                while ((read = in.read(buffer)) != -1) out.write(buffer, 0, read);
                out.flush(); callback("onExportComplete", "");
            } catch (Exception e) { callback("onNativeError", "Export fehlgeschlagen. Bitte erneut versuchen."); }
        }
        if (pendingExport.exists()) pendingExport.delete();
    });
    private final ActivityResultLauncher<String[]> importer = registerForActivityResult(new ActivityResultContracts.OpenDocument(), uri -> {
        if (uri == null) return;
        try (InputStream in = getContentResolver().openInputStream(uri)) {
            if (in == null) throw new java.io.IOException("No stream");
            callback("onImport", readLimited(in));
        } catch (Exception e) { callback("onNativeError", "Datei nicht lesbar oder größer als 10 MB."); }
    });
    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        stateFile = new AtomicFile(new File(getFilesDir(), "diary-v1.json"));
        pendingExport = new File(getCacheDir(), "pending-export");
        FrameLayout root = new FrameLayout(this); web = new WebView(this); root.addView(web);
        setContentView(root);
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
            view.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        final WebViewAssetLoader assets = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String resource = uri.toString();
                if ("data".equals(uri.getScheme()) && (resource.startsWith("data:image/png;base64,") || resource.startsWith("data:audio/ogg;base64,"))) return null;
                if ("https".equals(uri.getScheme()) && ORIGIN.equals(uri.getHost())) return assets.shouldInterceptRequest(uri);
                if ("https".equals(uri.getScheme()) && "world.openfoodfacts.org".equals(uri.getHost()) && uri.getPath() != null && uri.getPath().matches("/api/v2/product/[0-9]{8,14}\\.json")) return null;
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
        });
        web.addJavascriptInterface(new Bridge(), "Android");
        web.loadUrl("https://" + ORIGIN + "/assets/www/index.html");
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { web.evaluateJavascript("window.onAppBack && window.onAppBack()", null); }
        });
    }
    private String readLimited(InputStream in) throws java.io.IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream(); byte[] buffer = new byte[8192]; int count;
        while ((count = in.read(buffer)) != -1) { if (out.size() + count > MAX_BYTES) throw new java.io.IOException("Too large"); out.write(buffer, 0, count); }
        return out.toString(StandardCharsets.UTF_8.name());
    }
    private void callback(String name, String value) {
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window." + name + " && window." + name + "(" + JSONObject.quote(value) + ")", null); });
    }
    private final class Bridge {
        @JavascriptInterface public synchronized String readState() {
            if (!stateFile.getBaseFile().exists() && !new File(stateFile.getBaseFile() + ".bak").exists()) return "";
            try (InputStream in = stateFile.openRead()) { return readLimited(in); }
            catch (Exception e) { return "INVALID_STATE_PRESERVED"; }
        }
        @JavascriptInterface public synchronized boolean writeState(String json) {
            if (json == null || json.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) return false;
            FileOutputStream out = null;
            try {
                JSONObject object = new JSONObject(json);
                if (object.getInt("version") != 1 && object.getInt("version") != 2) return false;
                out = stateFile.startWrite(); out.write(json.getBytes(StandardCharsets.UTF_8)); stateFile.finishWrite(out); return true;
            } catch (Exception e) { if (out != null) stateFile.failWrite(out); return false; }
        }
        @JavascriptInterface public void scanBarcode() {
            runOnUiThread(() -> {
                try { scanner.launch(new ScanOptions().setDesiredBarcodeFormats(ScanOptions.PRODUCT_CODE_TYPES).setPrompt("Barcode in den Rahmen halten").setBeepEnabled(false).setOrientationLocked(false)); }
                catch (Exception e) { callback("onNativeError", "Kamera nicht verfügbar. Bitte Barcode manuell eingeben."); }
            });
        }
        @JavascriptInterface public void exportFile(String content, String filename, String mime) {
            if (content == null || content.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) { callback("onNativeError", "Export zu groß."); return; }
            if (!filename.matches("diaetfreund-[0-9-]+\\.(json|csv)") || !(mime.equals("application/json") || mime.equals("text/csv"))) return;
            try (FileOutputStream out = new FileOutputStream(pendingExport)) { out.write(content.getBytes(StandardCharsets.UTF_8)); }
            catch (Exception e) { callback("onNativeError", "Sicherung konnte nicht vorbereitet werden."); return; }
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType(mime).putExtra(Intent.EXTRA_TITLE, filename);
                exporter.launch(intent);
            });
        }
        @JavascriptInterface public void importFile() { runOnUiThread(() -> importer.launch(new String[]{"application/json", "text/plain", "application/octet-stream"})); }
        @JavascriptInterface public void exitApp() { runOnUiThread(() -> finish()); }
    }
    @Override protected void onDestroy() { if(web != null) { web.removeJavascriptInterface("Android"); web.destroy(); web = null; } super.onDestroy(); }
}
