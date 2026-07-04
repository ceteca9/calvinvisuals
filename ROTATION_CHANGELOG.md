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
| 2026-07-06 | `video_generate` | Versuch 2: vereinfacht auf 180° Drehung nach links, eine Richtung, kein End-Keyframe | Creation `jSHpdzpLD0`, 900 Credits — **vom Nutzer freigegeben** |
| 2026-07-06 | `src/assets/cube-rotation.mp4` | Freigegebenes Video heruntergeladen, mit ffmpeg auf 1280px Breite skaliert, Audio entfernt, H.264 CRF 25 (`-movflags +faststart`). 17.8MB → 1.66MB. | Web-Performance |
| 2026-07-06 | `src/ScrollVideoScrubber.tsx` (neu) | Fixed Video-Layer (`position:fixed; inset:0; z-index:-1`), Scroll-Progress via GSAP ScrollTrigger (`document.documentElement`, top top → bottom bottom) auf Video-Zeit gemappt, geglättet mit Lerp über `gsap.ticker`. Flaches dunkles Overlay (`rgba(0,0,0,0.6)`, gleicher Kontrast wie vorher). Fallback auf statisches Bild bei `prefers-reduced-motion` oder Viewport < 768px. Video-Decoder wird per play()+pause() "aufgeweckt". | Kernstück des Features |
| 2026-07-06 | `src/LandingPage.tsx` | `SCROLL_SCRUB_ENABLED`-Flag ergänzt; `<ScrollVideoScrubber>` als erstes Kind in `.cv-root` gemountet; altes `cv-hero-img`/`cv-hero-scrim` bleibt im Code, wird nur bei aktivem Flag nicht gerendert; CSS für `.cv-scrollbg` ergänzt, `.cv-root` bekommt `z-index:0` für sauberen Stacking-Context. | Bestehende Sektionen/Copy/CTA unverändert |

## Fix nach Nutzer-Feedback ("Scroll funktioniert nicht" + "Qualität verpixelt")

| Datum | Datei/Schritt | Änderung | Warum |
|---|---|---|---|
| 2026-07-06 | `src/assets/cube-rotation.mp4` | Neu encodiert aus dem Rohmaterial: 1920px Breite statt 1280px, CRF 19 statt 25 (1.66MB → 6.6MB) | Bei voller Bildschirmbreite wurde die 1280px-Version sichtbar hochskaliert und wirkte verpixelt |
| 2026-07-06 | `src/ScrollVideoScrubber.tsx` | `ScrollTrigger.refresh()` wird jetzt nach `document.fonts.ready`, `window.load` und zusätzlich nach 1s per Timeout erzwungen | Web-Fonts/Bilder können die Dokumenthöhe nach dem ersten Layout noch verändern; ScrollTrigger cacht Start/Ende beim Erstellen und muss nachträglich neu messen, sonst stimmt die Scroll-zu-Video-Zuordnung nicht mehr |

Nach dem Fix erneut verifiziert: `ScrollTrigger.getAll()` zeigt für den Video-Layer `start:0, end:2805` (= Dokumenthöhe − Viewport), `progress` folgt korrekt und monoton der Scroll-Position (0% → 0.0s, 25% → 3.3s, 100% → 10.0s), inkl. Rückwärts-Scrubben.

## Fix nach Nutzer-Feedback ("funktioniert nur bei sehr langsamem Scrollen, nicht smooth")

| Datum | Datei/Schritt | Änderung | Warum |
|---|---|---|---|
| 2026-07-06 | `src/assets/cube-rotation.mp4` | Neu encodiert mit `-g 1 -bf 0` (jedes Frame ein Keyframe, keine B-Frames), CRF 21, 1920px. 6.6MB → 14.8MB. | Das vorherige Encoding hatte nur wenige Keyframes (Standard-GOP) — bei schnellem Scrollen musste der Browser bei jedem Sprung erst vom letzten Keyframe vorwärts dekodieren, was ruckelte. Mit jedem Frame als Keyframe ist jeder Sprung ein direkter Zugriff ohne Dekodier-Kette. |

Gemessen: Beliebige `currentTime`-Sprünge lösen jetzt in 1-3ms auf (`seeked`-Event), vorher potenziell deutlich langsamer bei Sprüngen weit vom nächsten Keyframe entfernt. Zusätzlich mit einer Serie schneller, unregelmässiger Scroll-Sprünge (60ms Abstand) getestet — Video folgt sauber und bleibt nie hängen.

## Fix nach Nutzer-Feedback ("Qualität immer noch schlecht, vor allem Schwarz verpixelt")

| Datum | Datei/Schritt | Änderung | Warum |
|---|---|---|---|
| 2026-07-06 | `src/assets/cube-rotation.mp4` | Neu encodiert: CRF 21 → 14, zusätzlich `aq-mode=2:aq-strength=0.8` (adaptive Quantisierung), weiterhin `-g 1 -bf 0`. 14.8MB → 27MB. | CRF 21 kombiniert mit "jedes Frame ein Keyframe" führte zu sichtbaren Block-Artefakten (Banding) in den flachen schwarzen Flächen — per Frame-Crop-Vergleich (3x vergrössert) bestätigt und danach behoben. Rohmaterial von Kling selbst war sauber, das Banding kam vom eigenen Re-Encoding. |

Verifiziert per Vorher/Nachher-Frame-Vergleich (Crop + 3x Vergrösserung der schwarzen Bildecke): sichtbares Blockmuster verschwunden. Seek-Geschwindigkeit bleibt bei ~4ms pro Sprung (Smoothness nicht beeinträchtigt).

## Verify-Checkliste (durchgeführt)

- [x] Scroll-Progress mappt korrekt auf Video-Zeit über die volle Seitenlänge — geprüft bei 0%, 25%, 100% Scroll-Position (monoton, konsistent)
- [x] Rückwärts-Scrubben beim Hochscrollen funktioniert (10s → 0s bestätigt)
- [x] Videoqualität deutlich verbessert (1920px/CRF19 statt 1280px/CRF25)
- [x] Alle Sektionen, Texte und der Calendly-CTA sind identisch zum Stand vor dem Feature (Accessibility-Snapshot verglichen)
- [x] Text bleibt lesbar (Screenshot bei 50% Scroll geprüft — Ablauf-Karten und Founder-Sektion über dem Video gut lesbar)
- [x] Mobile-Fallback (< 768px) und `prefers-reduced-motion` zeigen das statische Bild statt Video (Code-Pfad wie in `ScrollVideoScrubber.tsx`)
- [ ] 60fps-Messung unter echter Scroll-Last — in dieser Umgebung nicht messbar, bitte im echten Browser gegenprüfen
