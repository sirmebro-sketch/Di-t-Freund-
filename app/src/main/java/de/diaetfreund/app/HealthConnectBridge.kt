package de.diaetfreund.app

import android.content.Intent
import android.net.Uri
import androidx.activity.ComponentActivity
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.units.Mass
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject
import java.time.Period
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.function.Consumer

/** Foreground-only, opt-in bridge. Only weight records created by this app can be exported. */
class HealthConnectBridge(private val activity: ComponentActivity, private val callback: Consumer<String>) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var busy = false
    private var pendingId: String? = null
    private var pendingWrite = false
    private val readSteps = HealthPermission.getReadPermission(StepsRecord::class)
    private val readSleep = HealthPermission.getReadPermission(SleepSessionRecord::class)
    private val readWeight = HealthPermission.getReadPermission(WeightRecord::class)
    private val writeWeight = HealthPermission.getWritePermission(WeightRecord::class)
    private val launcher = activity.registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { granted ->
        val id = pendingId
        pendingId = null; busy = false
        if (id != null) send(id, JSONObject().put("kind", "permissions").put("mode", if(pendingWrite) "write" else "read").put("granted", JSONArray(granted.toList())))
    }
    private fun send(id: String, obj: JSONObject) { callback.accept(obj.put("requestId", id).toString()) }
    private fun status(): Int = HealthConnectClient.getSdkStatus(activity)
    fun handle(raw: String) {
        val q = try { JSONObject(raw) } catch (_: Exception) { return }
        val id = q.optString("requestId"); if (id.length !in 1..100) return
        if (busy) { send(id, JSONObject().put("kind","error").put("message","Ein Health-Connect-Vorgang läuft bereits.")); return }
        val action=q.optString("action")
        if (action=="settings" || action=="install") {
            try {
                val intent=if(action=="install") Intent(Intent.ACTION_VIEW,Uri.parse("https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata")) else Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
                activity.startActivity(intent)
                send(id,JSONObject().put("kind","opened").put("message","Systemseite geöffnet. Danach hier erneut aktualisieren."))
            } catch (_:Exception) {send(id,JSONObject().put("kind","error").put("message","Bitte in Android nach Health Connect suchen."))}
            return
        }
        if(status()!=HealthConnectClient.SDK_AVAILABLE){send(id,JSONObject().put("kind","status").put("message",if(status()==HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) "Health Connect bitte installieren oder aktualisieren." else "Health Connect ist auf diesem Gerät nicht verfügbar (Android 9 oder neuer erforderlich)."));return}
        val client=HealthConnectClient.getOrCreate(activity)
        val read=q.optJSONObject("read")?:JSONObject()
        if(action=="request" || action=="requestWrite") {
            val requested=mutableSetOf<String>()
            if(action=="requestWrite") requested.add(writeWeight) else {
                if(read.optBoolean("steps"))requested.add(readSteps)
                if(read.optBoolean("sleep"))requested.add(readSleep)
                if(read.optBoolean("weight"))requested.add(readWeight)
            }
            if(requested.isEmpty()){send(id,JSONObject().put("kind","status").put("message","Bitte mindestens einen Datentyp auswählen."));return}
            pendingId=id;pendingWrite=action=="requestWrite";busy=true
            try {launcher.launch(requested)} catch(_:Exception){pendingId=null;busy=false;send(id,JSONObject().put("kind","error").put("message","Die Berechtigungsabfrage ist nicht verfügbar. Bitte Systemfreigaben prüfen."))}
            return
        }
        busy=true
        scope.launch {
            try {
                val result=withContext(Dispatchers.IO){
                    when(action){
                        "sync" -> readSnapshot(client,read,q.optBoolean("discover"))
                        "write" -> writeWeights(client,q.getJSONArray("weights"))
                        else -> JSONObject().put("kind","status").put("message","Health Connect ist verfügbar.")
                    }
                }
                send(id,result)
            } catch(e:CancellationException){throw e}
            catch(_:SecurityException){send(id,JSONObject().put("kind","error").put("message","Zugriff fehlt oder wurde widerrufen. Bitte Freigaben prüfen; vorhandene Daten wurden nicht ersetzt."))}
            catch(_:Exception){send(id,JSONObject().put("kind","error").put("message","Health Connect konnte den Vorgang nicht abschließen. Bitte später erneut versuchen. Ein erneutes Senden von Gewichten erzeugt keine doppelten Einträge."))}
            finally {busy=false}
        }
    }
    private suspend fun readSnapshot(client: HealthConnectClient, selected: JSONObject, discover: Boolean): JSONObject {
        val granted=client.permissionController.getGrantedPermissions()
        val zone=ZoneId.systemDefault();val now=Instant.now();val end=LocalDate.now(zone);val start=end.minusDays(29)
        val successful=JSONArray();val warnings=JSONArray();val weights=JSONArray();val sources=mutableSetOf<String>()
        val rows=(0L..29L).associate { i -> start.plusDays(i).toString() to JSONObject().put("date",start.plusDays(i).toString()).put("steps",JSONObject.NULL).put("sleep",JSONObject.NULL) }
        val steps=(selected.optBoolean("steps")||discover)&&readSteps in granted
        val sleep=(selected.optBoolean("sleep")||discover)&&readSleep in granted
        val weight=(selected.optBoolean("weight")||discover)&&readWeight in granted
        if(!steps&&(selected.optBoolean("steps")||discover))warnings.put("Schritte: Lesefreigabe für FitDex fehlt.")
        if(!sleep&&selected.optBoolean("sleep"))warnings.put("Schlaf: Lesefreigabe fehlt.")
        if(!weight&&selected.optBoolean("weight"))warnings.put("Gewicht: Lesefreigabe fehlt.")
        // One deduplicated local-calendar query per type. A denied/broken sleep query must not discard steps.
        suspend fun readType(name:String, block:suspend ()->Unit) {
            try { block(); successful.put(name) }
            catch(e:CancellationException){throw e}
            catch(_:SecurityException){warnings.put("$name: Zugriff verweigert. Bitte Systemfreigaben prüfen; bisherige Werte bleiben erhalten.")}
            catch(_:Exception){warnings.put("$name: Lesen fehlgeschlagen. Bisherige Werte bleiben erhalten; bitte erneut aktualisieren.")}
        }
        val range=TimeRangeFilter.between(start.atStartOfDay(),now.atZone(zone).toLocalDateTime())
        if(steps)readType("steps") {
            val result=client.aggregateGroupByPeriod(AggregateGroupByPeriodRequest(metrics=setOf(StepsRecord.COUNT_TOTAL),timeRangeFilter=range,timeRangeSlicer=Period.ofDays(1)))
            result.forEach { bucket ->
                bucket.result[StepsRecord.COUNT_TOTAL]?.let { count ->
                    require(count in 0..100000)
                    rows[bucket.startTime.toLocalDate().toString()]?.put("steps",count)
                    sources.addAll(bucket.result.dataOrigins.map { it.packageName })
                }
            }
            if(rows[end.toString()]!!.isNull("steps"))warnings.put("Health Connect liefert heute noch keine Schritte. In Samsung Health das Schreiben von Schritten erlauben und Samsung Health öffnen; in Health Connect unter Schritte die vorhandenen Einträge prüfen.")
        }
        if(sleep)readType("sleep") {
            val result=client.aggregateGroupByPeriod(AggregateGroupByPeriodRequest(metrics=setOf(SleepSessionRecord.SLEEP_DURATION_TOTAL),timeRangeFilter=range,timeRangeSlicer=Period.ofDays(1)))
            result.forEach { bucket -> bucket.result[SleepSessionRecord.SLEEP_DURATION_TOTAL]?.let { duration ->
                val hours=duration.toMillis()/3600000.0; require(hours in 0.0..24.0)
                rows[bucket.startTime.toLocalDate().toString()]?.put("sleep",hours)
            }}
        }
        if(weight)readType("weight") {
            var token:String?=null
            do {
                val response=client.readRecords(ReadRecordsRequest(recordType=WeightRecord::class,timeRangeFilter=TimeRangeFilter.between(start.atStartOfDay(zone).toInstant(),now),pageSize=500,pageToken=token))
                for(w in response.records){
                    if(w.metadata.dataOrigin.packageName==activity.packageName)continue
                    val kg=w.weight.inKilograms;if(kg !in 35.0..350.0)continue
                    weights.put(JSONObject().put("id",w.metadata.id).put("origin",w.metadata.dataOrigin.packageName).put("date",w.time.atZone(zone).toLocalDate().toString()).put("time",w.time.toString()).put("value",kg))
                    if(weights.length()>5000)throw IllegalStateException("Too many records")
                }
                token=response.pageToken
            }while(token!=null)
        }
        if(successful.length()==0)return JSONObject().put("kind","error").put("message",if(warnings.length()>0)(0 until warnings.length()).joinToString(" "){warnings.getString(it)} else "Keine Lesefreigabe. Bitte Schritte auswählen und Zugriff erlauben.")
        return JSONObject().put("kind","sync").put("from",start.toString()).put("to",end.toString()).put("at",now.toString()).put("read",successful).put("days",JSONArray(rows.values.toList())).put("weights",if((0 until successful.length()).any{successful.getString(it)=="weight"})weights else JSONArray()).put("warnings",warnings).put("stepSources",JSONArray(sources.toList())).put("discoveredPermissions",discover)
    }
    private suspend fun writeWeights(client:HealthConnectClient,input:JSONArray):JSONObject {
        if(writeWeight !in client.permissionController.getGrantedPermissions())throw SecurityException()
        require(input.length() in 1..30)
        val now=Instant.now();val zone=ZoneId.systemDefault();val seen=mutableSetOf<LocalDate>()
        val records=(0 until input.length()).map{i->
            val row=input.getJSONObject(i);val date=LocalDate.parse(row.getString("date"));val kg=row.getDouble("value")
            require(date<=LocalDate.now(zone)&&kg in 35.0..350.0&&seen.add(date))
            val time=minOf(date.atTime(12,0).atZone(zone).toInstant(),now)
            WeightRecord(time=time,zoneOffset=zone.rules.getOffset(time),weight=Mass.kilograms(kg),metadata=Metadata.manualEntry(clientRecordId="diaetfreund-weight-$date",clientRecordVersion=System.currentTimeMillis()))
        }
        client.insertRecords(records)
        return JSONObject().put("kind","written").put("count",records.size)
    }
    fun close(){scope.cancel()}
}
