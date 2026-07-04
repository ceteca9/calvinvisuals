# Cube-Rotation Changelog

## Rollback — Alles rückgängig machen mit einem Schritt

```
git checkout main
```

Verwirft den Feature-Branch, `main` bleibt komplett unberührt.

- Baseline-Tag: `pre-cube-rotation`
- Feature-Branch: `feature/cube-rotation`

---

## Konzept

Ein einziger Video-Clip (~8-10s, Kling 3.0), kein Kamera-Orbit — die Kamera
steht fix wie ein Kran an genau der Position des bestehenden Hintergrundbilds,
das Glasbüro dreht sich selbst um die eigene Achse (wie auf einem
Drehteller), über die volle Scroll-Länge der 3 Sektionen.

**Update nach Versuch 1:** 360°-Loop-Vorgabe führte zu einer unruhigen
Pendel-Bewegung (mal leicht links, mal leicht rechts) statt einer sauberen
Drehung. Vereinfacht auf **180° Drehung nach links, eine Richtung, kein
Loop-Zwang** (kein End-Keyframe mehr).

**Wichtig (Nutzer-Vorgabe):** Video wird NICHT automatisch in die Webseite
eingebaut. Nach der Generierung zeige ich das Ergebnis und warte auf OK,
bevor der Scroll-Scrub-Code integriert wird.

## Log

| Datum | Datei/Schritt | Änderung | Warum |
|---|---|---|---|
| 2026-07-06 | `ROTATION_CHANGELOG.md` | Angelegt | Protokoll für dieses Feature |
| 2026-07-06 | (git) | Branch `feature/cube-rotation`, Tag `pre-cube-rotation` auf letzten `main`-Commit | Rollback-Anker |
| 2026-07-06 | Magnific Upload | Referenzbild `neuer hintergrund.png` hochgeladen | Creation `KjC0ZYtkqp` |
| 2026-07-06 | `simulate_cost` | Kling 3.0, 10s, 1080p, 16:9 → 900 Credits (simuliert) | Kostenschätzung vor Generierung, Nutzer hat bestätigt |
| 2026-07-06 | `video_generate` | Versuch 1: fixe Kran-Kamera, Büro dreht sich 360° selbst, Start=End-Keyframe (Loop) | Creation `kLETAEE16B`, 900 Credits — Nutzer-Feedback: pendelt statt sauber zu drehen |
| 2026-07-06 | `video_generate` | Versuch 2: vereinfacht auf 180° Drehung nach links, eine Richtung, kein End-Keyframe | siehe unten |
