import { today, shiftDate, totals } from "./core.js";
export function ageAt(birthDate, date = today()) {
  const b = new Date(birthDate + "T12:00:00"),
    d = new Date(date + "T12:00:00");
  let age = d.getFullYear() - b.getFullYear();
  if (
    d.getMonth() < b.getMonth() ||
    (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())
  )
    age--;
  return age;
}
export function currentWeight(s, date = today()) {
  return (
    [...s.weights]
      .filter((w) => w.date <= date)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.value ??
    s.profile?.start
  );
}
export function energyModel(s, date = today()) {
  const c = s.coach,
    p = s.profile;
  if (!c || !p || c.nutritionCare || !["male", "female"].includes(c.sex))
    return null;
  const age = ageAt(c.birthDate, date);
  if (age < 18 || age > 100) return null;
  const weight = currentWeight(s, date),
    bmr =
      10 * weight + 6.25 * p.height - 5 * age + (c.sex === "male" ? 5 : -161),
    tdee = bmr * c.activity;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    low: Math.round((tdee * 0.85) / 50) * 50,
    high: Math.round((tdee * 1.15) / 50) * 50,
    start: Math.round(Math.max(1500, tdee - 300) / 50) * 50,
    weight,
    age,
  };
}
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
export function weeklyReview(s, date = today()) {
  const end = shiftDate(date, -1),
    start = shiftDate(end, -20),
    allDays = Array.from({ length: 21 }, (_, i) => shiftDate(start, i));
  const complete = allDays.filter(
    (d) => s.completeDays[d] === true && s.entries.some((e) => e.date === d),
  );
  const first = s.weights.filter(
    (w) => w.date >= start && w.date <= shiftDate(start, 6),
  );
  const last = s.weights.filter(
    (w) => w.date >= shiftDate(end, -6) && w.date <= end,
  );
  const change =
    first.length && last.length
      ? avg(first.map((w) => w.value)) - avg(last.map((w) => w.value))
      : null;
  const elapsed =
    first.length && last.length
      ? (avg(last.map((w) => Date.parse(w.date))) -
          avg(first.map((w) => Date.parse(w.date)))) /
        86400000
      : null;
  const perWeek = change === null || !elapsed ? null : change / (elapsed / 7),
    meanIntake = complete.length
      ? avg(
          complete.map(
            (d) => totals(s.entries.filter((e) => e.date === d)).kcal,
          ),
        )
      : null;
  const ready = complete.length >= 18 && first.length >= 3 && last.length >= 3;
  const measured =
    ready && Math.abs(perWeek) <= 1.5
      ? Math.round((meanIntake + (perWeek * 7700) / 7) / 50) * 50
      : null;
  const checkins = Object.entries(s.checkins)
    .filter(([d]) => d >= shiftDate(end, -6) && d <= date)
    .map(([, c]) => c);
  const recoveryConcern = checkins.some(
    (c) => c.pain || c.fatigue >= 4 || c.hunger >= 4,
  );
  const lastChange = s.targetHistory.at(-1);
  const cooling = lastChange && lastChange.date > shiftDate(date, -14);
  let status = "learning",
    title = "Dein Kompass lernt deinen Alltag kennen.",
    reason = `${complete.length}/18 vollständige Tage · ${first.length}/3 frühe und ${last.length}/3 aktuelle Gewichtswerte im 21-Tage-Fenster.`,
    suggested = null;
  if (ready) {
    status = "steady";
    title = "Dein Verlauf wird aussagekräftiger.";
    reason =
      "Verglichen werden die erste und letzte Woche im 21-Tage-Fenster. Wasser, Verdauung und Erfassungsfehler bleiben Einflussfaktoren.";
  }
  if (ready && perWeek > 1) {
    status = "review";
    title = "Das Gewicht verändert sich recht schnell.";
    reason =
      "Bitte Ernährung, Befinden und Verlauf fachlich prüfen; die App verschärft dein Defizit nicht.";
  }
  if (recoveryConcern) {
    status = "recovery";
    title = "Heute zählt, wie es dir geht.";
    reason =
      "Du hast starken Hunger, Erschöpfung oder Schmerzen gemeldet. Keine automatische Steigerung oder Kaloriensenkung.";
  }
  if (s.coach?.nutritionCare) {
    status = "medical";
    title = "Deine individuellen Vorgaben gehen vor.";
    reason =
      "Für deinen medizinischen Ernährungsbedarf werden keine automatischen Kalorien- oder Nährstoffziele abgeleitet.";
  } else if (
    s.coach &&
    ready &&
    meanIntake >= 1500 &&
    !cooling &&
    !recoveryConcern &&
    perWeek >= 0.1 &&
    perWeek <= 1 &&
    measured >= 1500 &&
    measured <= 6000
  ) {
    const candidate = Math.round(Math.max(1500, measured - 300) / 50) * 50;
    const difference = Math.max(
      -100,
      Math.min(100, candidate - s.profile.kcal),
    );
    if (Math.abs(difference) >= 50) {
      suggested = s.profile.kcal + difference;
      status = "proposal";
      title = "Ein kleiner Zielvorschlag für deinen Verlauf.";
      reason =
        "Heuristische Schätzung aus vollständigen Esstagen und Gewichtstrend. Maximal 100 kcal Änderung; nur nach deiner Bestätigung, frühestens alle 14 Tage.";
    }
  } else if (ready && perWeek !== null && perWeek < 0.1 && !recoveryConcern) {
    title = "Erst prüfen, dann verändern.";
    reason =
      "Bei Stillstand oder Zunahme prüfen wir zuerst Portionsangaben, vollständige Tage und Schwankungen. Keine automatische Kaloriensenkung.";
  }
  if (s.profile && currentWeight(s, date) <= s.profile.goal) {
    status = "goal";
    title = "Dein gesetztes Gewichtsziel ist erreicht.";
    reason =
      "Jetzt lohnt sich eine bewusste Planung der Erhaltungsphase. Kein weiteres Defizit wird vorgeschlagen.";
    suggested = null;
  }
  return {
    status,
    title,
    reason,
    complete: complete.length,
    first: first.length,
    last: last.length,
    ready,
    perWeek,
    meanIntake,
    measured,
    suggested,
    cooling: !!cooling,
    start,
    end,
  };
}
export function readiness(s, date = today()) {
  const c = s.coach,
    check = s.checkins[date];
  if (c?.hypertension && !c.trainingCleared)
    return {
      level: "caution",
      title: "Belastbarkeit zuerst abstimmen",
      message:
        "Bei Bluthochdruck den Wiedereinstieg und die Belastungsgrenzen ärztlich abstimmen. Trainingsprotokoll bleibt verfügbar; keine Laststeigerung empfohlen.",
    };
  if (check?.pain)
    return {
      level: "caution",
      title: "Beschwerden haben Vorrang",
      message:
        "Kein Krafttraining gegen Schmerzen. Ursache abklären; akute Beschwerden gehören nicht in eine App-Auswertung.",
    };
  if (check?.fatigue >= 4)
    return {
      level: "rest",
      title: "Heute darf es leichter sein",
      message:
        "Erholung oder eine kurze, leichte Einheit statt zusätzlichem Umfang. Keine automatische Laststeigerung.",
    };
  const recent = s.workouts.some(
    (w) =>
      w.sets.some((x) => x.done) &&
      w.date >= shiftDate(date, -1) &&
      w.date <= date,
  );
  if (recent)
    return {
      level: "rest",
      title: "Erholung gehört zu deinem Plan",
      message:
        "In den letzten zwei Kalendertagen hast du Krafttraining protokolliert. Heute bietet sich Erholung oder lockere Bewegung an.",
    };
  return {
    level: "normal",
    title: "Dein nächster machbarer Schritt",
    message: c?.betaBlocker
      ? "Belastung über Wohlbefinden und Sprechtest einschätzen; unter Betablockern keine Standard-Pulszonen verwenden."
      : "Kontrolliert trainieren, ruhig atmen und ausreichend Wiederholungen in Reserve lassen.",
  };
}
export function trainingRoutines(s, base) {
  if (!s.coach) return base;
  const c = s.coach,
    home = base.map((r) => ({
      ...r,
      place: "home",
      subtitle: `Zu Hause · etwa ${c.homeMinutes} Minuten · 2 Sätze je Übung`,
    }));
  const gym = [
    {
      name: "Gym A · Ganzkörper",
      place: "gym",
      subtitle: `Gym · Zeitfenster ${c.gymMinutes} Minuten`,
      exercises: [
        "Beinpresse, moderat",
        "Rudermaschine",
        "Brustpresse",
        "Beinbeuger",
        "Dead Bug",
      ],
    },
    {
      name: "Gym B · Ganzkörper",
      place: "gym",
      subtitle: `Gym · Zeitfenster ${c.gymMinutes} Minuten`,
      exercises: [
        "Aufstehen vom Stuhl",
        "Latzug zur Brust",
        "Brustpresse",
        "Hüftheben",
        "Bird Dog",
      ],
    },
  ];
  return c.location === "home"
    ? home
    : c.location === "gym"
      ? gym
      : [...home, ...gym];
}
export function previousSets(s, name) {
  return (
    [...s.workouts]
      .filter((w) => w.name === name)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.sets || []
  );
}
export function foodKey(f) {
  return f.foodId || f.barcode || f.name;
}
export function rememberedAmount(s, f) {
  return (
    [...s.entries].reverse().find((e) => foodKey(e) === foodKey(f))?.amount ||
    100
  );
}
