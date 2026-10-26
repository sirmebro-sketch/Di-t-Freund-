import {
  emptyConnection,
  applyHealthSnapshot,
  weightsForSharing,
} from "./health-sync.js";
import { today } from "./core.js";
export function setupHealthUI({
  getState,
  commit,
  render,
  sheet,
  btn,
  esc,
  fmt,
  notify,
}) {
  let busy = false,
    lastAttempt = 0,
    requestId = null,
    message = "",
    sharePreview = null;
  const native = () => typeof window.Android?.healthConnect === "function";
  function call(action, data = {}) {
    if (!native()) {
      notify("Health Connect ist nur in der Android-App verfügbar.");
      return;
    }
    if (busy) return;
    busy = true;
    requestId = crypto.randomUUID();
    lastAttempt = Date.now();
    window.Android.healthConnect(
      JSON.stringify({ action, requestId, ...data }),
    );
    setTimeout(() => {
      if (busy && Date.now() - lastAttempt >= 60000) {
        busy = false;
        requestId = null;
        notify(
          "Health Connect antwortet noch nicht. Bitte später erneut versuchen.",
        );
      }
    }, 61000);
  }
  function settings() {
    const c = getState().healthConnect || {...emptyConnection(),readSteps:true,autoRead:true};
    sheet(
      "Samsung Health & Health Connect",
      `<p>Deine Schritte werden von Samsung Health oder einer anderen verbundenen App erfasst. DiätFreund übernimmt freigegebene Daten beim Öffnen oder auf Knopfdruck.</p><p class="hint">${esc(message || c.statusText || "Lesen und Schreiben sind getrennt. Standardmäßig ist nichts freigegeben.")}</p>${native() ? "" : '<p class="hint">Im Browser nicht verfügbar. Bitte die Android-App verwenden.</p>'}<div id="health-options">${[
        ["readSteps", "Schritte lesen"],
        ["readSleep", "Schlafdauer lesen"],
        ["readWeight", "Gewicht lesen"],
        ["autoRead", "Beim Öffnen automatisch aktualisieren"],
      ]
        .map(
          ([key, label]) =>
            `<label class="checkbox"><input type="checkbox" id="hc-${key}" ${c[key] ? "checked" : ""}>${label}</label>`,
        )
        .join(
          "",
        )}</div><div class="toolbar">${btn("Auswahl speichern & Zugriff erlauben", "hc-connect", "primary")}${btn("Jetzt aktualisieren", "hc-sync", "secondary")}${btn("Systemfreigaben öffnen", "hc-settings", "secondary")}</div><p>Letztes erfolgreiches Einlesen: ${c.lastSync ? esc(new Date(c.lastSync).toLocaleString("de-DE")) : "noch keines"}. Bis zu 30 Tage werden abgeglichen. Fehlende Daten bleiben unbekannt. Manuelle Gewichte haben Vorrang.</p><h3>Daten an andere Apps geben</h3><p>Nur deine zuletzt bis zu 30 selbst eingetragenen Gewichte können nach Vorschau an Health Connect gesendet werden. Importierte Daten werden nie zurückgeschrieben. Samsung Health entscheidet anhand seiner Freigaben, ob es die Daten übernimmt.</p>${btn("Gewichte zum Teilen prüfen", "hc-preview", "secondary")}<p class="footnote">Einträge werden nach Datum aktualisiert, nicht bei jedem Senden neu angelegt. Löschungen in DiätFreund löschen keine bereits geteilten Werte; entferne diese bei Bedarf in Health Connect.</p><h3>Einmal in Samsung Health einrichten</h3><ol><li>Samsung Health → Einstellungen → Health Connect öffnen.</li><li>Samsung Health das Schreiben von Schritten, Schlaf und Gewicht erlauben. Zum Empfangen geteilter Gewichte auch Lesen erlauben.</li><li>Hier die gewünschten Daten wählen und DiätFreund den Zugriff erlauben.</li><li>Samsung Health öffnen bzw. aktualisieren, danach hier „Jetzt aktualisieren“.</li></ol><p>Keine garantierte Echtzeitverbindung. Galaxy-Watch-Daten müssen zuerst am Smartphone ankommen. Schritte erhöhen weder dein Kalorienziel noch deine Spielbelohnung.</p><div class="toolbar">${btn("Health Connect installieren / aktualisieren", "hc-install", "text-button")}${btn("Lokale Importkopien entfernen", "hc-clear", "text-button")}</div><p class="footnote">Zum vollständigen Trennen zusätzlich die Android-Systemfreigaben widerrufen. Das Entfernen lokaler Kopien löscht keine Daten in Samsung Health oder Health Connect.</p>`,
    );
  }
  function card(date = today()) {
    const c = getState().healthConnect,
      d = c?.days[date];
    return `<section class="card steps-card"><div class="section-head"><h2>Schritte & Erholung</h2>${btn(c?.lastSync?"Verbindung prüfen":"Verbinden", "hc-open", "text-button")}</div><div class="two-grid"><div><small>Schritte · Health Connect</small><strong class="big-number">${d?.steps == null ? "–" : fmt(d.steps)}</strong></div><div><small>Schlafdauer · Health Connect</small><strong class="big-number">${d?.sleep == null ? "–" : fmt(d.sleep, 1) + " h"}</strong></div></div><p>${c?.lastSync ? "Stand: " + esc(new Date(c.lastSync).toLocaleString("de-DE")) : "Samsung Health verbinden, um vorhandene Daten zu übernehmen."}</p>${d?.steps==null?`<p class="hint">${esc(message||c?.statusText||"Noch keine Schritte geliefert. Verbindung prüfen oder jetzt aktualisieren.")}</p>`:""}${btn("Aktualisieren", "hc-sync", "secondary")}</section>`;
  }
  function options() {
    const c = getState().healthConnect || emptyConnection();
    return { steps: c.readSteps, sleep: c.readSleep, weight: c.readWeight };
  }
  function sync(auto = false) {
    const o = options();
    if (!Object.values(o).some(Boolean)) {
      if (!auto) call("sync", {read:o,discover:true});
      return;
    }
    if (
      auto &&
      (!getState().healthConnect?.autoRead ||
        Date.now() - lastAttempt < 300000 ||
        !native() ||
        document.visibilityState === "hidden")
    )
      return;
    call("sync", { read: o });
  }
  window.onHealthConnect = (raw) => {
    try {
      const p = JSON.parse(raw);
      if (p.requestId !== requestId) return;
      busy = false;
      requestId = null;
      if (p.kind === "sync") {
        message = p.warnings?.length ? p.warnings.join(" ") : "Abgleich abgeschlossen.";
        if(p.stepSources?.length)message += " Schrittquelle: " + p.stepSources.map(x=>x==='com.sec.android.app.shealth'?'Samsung Health':x).join(', ') + '.';
        if (commit((s) => { applyHealthSnapshot(s, p); s.healthConnect.statusText=message.slice(0,2000);if(p.discoveredPermissions){for(const [k,v] of [['readSteps','steps'],['readSleep','sleep'],['readWeight','weight']])s.healthConnect[k]=p.read.includes(v);s.healthConnect.autoRead=true;} }, true)) {
          render(); notify(p.warnings?.length ? "Abgleich mit Hinweisen – siehe Schrittverbindung." : "Health-Connect-Daten aktualisiert.");
        }
        if(document.querySelector('#health-options'))settings();
      } else if (p.kind === "permissions") {
        message =
          "Freigaben aktualisiert. Abgelehnte Datentypen bleiben unzugänglich.";
        if (p.mode === "write" && sharePreview) actions["hc-preview"]();
        else { settings(); sync(false); }
      } else if (p.kind === "written") {
        sharePreview = null;
        message = `${p.count} eigene Gewichtseinträge an Health Connect gesendet.`;
        notify(message);
        settings();
      } else {
        message = p.message || "Health Connect ist gerade nicht verfügbar.";
        notify(message);
        if (p.kind === "status") settings();
      }
    } catch {
      busy = false;
      notify(
        "Health-Connect-Antwort konnte nicht übernommen werden. Bestehende Daten bleiben erhalten.",
      );
    }
  };
  window.onAppResume = () => sync(true);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") sync(true);
  });
  const actions = {
    "hc-open": settings,
    "hc-connect": () => {
      const next = { ...(getState().healthConnect || emptyConnection()) };
      for (const k of ["readSteps", "readSleep", "readWeight", "autoRead"])
        next[k] = !!document.querySelector("#hc-" + k)?.checked;
      if (commit((s) => (s.healthConnect = next), true))
        call("request", { read: options() });
    },
    "hc-sync": () => sync(false),
    "hc-settings": () => call("settings"),
    "hc-install": () => call("install"),
    "hc-preview": () => {
      sharePreview = weightsForSharing(getState());
      sheet(
        "Eigene Gewichte teilen",
        `<p>Diese ${sharePreview.length} selbst eingetragenen Werte gehen an Health Connect. Dort können Apps mit deiner Lesefreigabe darauf zugreifen. Pro Datum wird ein Wert aktualisiert; die App hat keine Uhrzeit erfasst und verwendet Tagesmitte (heute höchstens jetzt).</p>${sharePreview.map((w) => `<p>${w.date}: <strong>${fmt(w.value, 1)} kg</strong></p>`).join("") || "<p>Keine eigenen Gewichtseinträge vorhanden.</p>"}<div class="toolbar">${btn("Abbrechen", "hc-open", "secondary")}${sharePreview.length ? btn("Schreibzugriff erlauben", "hc-write-permission", "secondary") + btn("Diese Gewichte jetzt senden", "hc-send", "primary") : ""}</div>`,
      );
    },
    "hc-write-permission": () => call("requestWrite"),
    "hc-send": () => {
      if (!sharePreview) return;
      call("write", { weights: sharePreview });
    },
    "hc-clear": () =>
      sheet(
        "Importkopien entfernen?",
        `<p>Entfernt nur die lokalen Health-Connect-Kopien und deaktiviert automatisches Einlesen. Deine eigenen Einträge bleiben erhalten.</p>${btn("Abbrechen", "hc-open", "secondary")}${btn("Lokale Kopien entfernen", "hc-confirm-clear", "primary")}`,
      ),
    "hc-confirm-clear": () => {
      requestId = null; busy = false; sharePreview = null; message = "Lokale Importkopien entfernt.";
      if (commit((s) => (s.healthConnect = emptyConnection()), true)) {
        render();
        settings();
      }
    },
  };
  function invalidatePending() {
    requestId = null;
    busy = false;
    sharePreview = null;
    message = "";
  }
  return { card, actions, sync, invalidatePending };
}
