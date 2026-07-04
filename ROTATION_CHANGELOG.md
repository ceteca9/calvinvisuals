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
Drehteller), 1x komplett 360° über die volle Scroll-Länge der 3 Sektionen.
Seamless Loop (Start- und Endframe identisch).

**Wichtig (Nutzer-Vorgabe):** Video wird NICHT automatisch in die Webseite
eingebaut. Nach der Generierung zeige ich das Ergebnis und warte auf OK,
bevor der Scroll-Scrub-Code integriert wird.

## Log

| Datum | Datei/Schritt | Änderung | Warum |
|---|---|---|---|
| 2026-07-06 | `ROTATION_CHANGELOG.md` | Angelegt | Protokoll für dieses Feature |
| 2026-07-06 | (git) | Branch `feature/cube-rotation`, Tag `pre-cube-rotation` auf letzten `main`-Commit | Rollback-Anker |
