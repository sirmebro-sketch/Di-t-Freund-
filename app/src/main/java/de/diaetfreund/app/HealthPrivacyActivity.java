package de.diaetfreund.app;
import android.app.Activity;
import android.os.Bundle;
import android.widget.ScrollView;
import android.widget.TextView;
/** Accessible local permission rationale, including the Android 14 permission-usage alias. */
public final class HealthPrivacyActivity extends Activity {
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        TextView text = new TextView(this); text.setTextSize(18); text.setPadding(28,40,28,40);
        text.setText("DiätFreund – Gesundheitsdaten\n\n" +
            "Mit deiner Freigabe liest DiätFreund Schritte, Schlafsitzungen und Gewicht aus Health Connect. Du wählst jeden Datentyp einzeln. Importierte Kopien bleiben im privaten App-Speicher; keine Werbung, Analyse-Tracker oder Übertragung an einen eigenen Server.\n\n" +
            "Nur nach separater Schreibfreigabe und einer konkreten Bestätigung können bis zu 30 selbst eingetragene Gewichte an Health Connect gesendet werden. Andere dort von dir freigegebene Apps, etwa Samsung Health, können diese Werte lesen. Importierte Werte werden nicht zurückgeschrieben.\n\n" +
            "Das Einlesen erfolgt während der App-Nutzung. Es gibt keinen eigenen Hintergrund-Schrittzähler. Fehlende Daten werden nicht als null Schritte behandelt. Daten dienen deinem Tagebuch, nicht einer Diagnose oder medizinischen Überwachung.\n\n" +
            "Du kannst die Freigaben jederzeit in Health Connect widerrufen. Lokale Importkopien entfernst du unter Mehr → Samsung Health & Health Connect. Bereits geteilte Daten können in Health Connect gelöscht werden. Eine Löschung hier wird nicht automatisch in anderen Apps ausgeführt.\n\n" +
            "JSON-Sicherungen enthalten auch importierte Gesundheitsdaten unverschlüsselt. Bewahre sie geschützt auf. App-Deinstallation löscht die lokalen Kopien. Für die Datenverwendung durch Samsung Health und weitere freigegebene Apps gelten deren eigene Einstellungen und Datenschutzhinweise.");
        ScrollView scroll = new ScrollView(this); scroll.addView(text); setContentView(scroll);
    }
}
