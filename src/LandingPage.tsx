import { useLayoutEffect, useRef } from "react";
import heroImg from "./assets/hero.jpg";
import calvinImg from "./assets/calvin.jpg";
import werbungImg from "./assets/pillar-werbung.jpg";
import contentImg from "./assets/pillar-content.jpg";
import umsatzImg from "./assets/pillar-umsatz.jpg";
import { gsap, ScrollTrigger, DURATION, EASE, prefersReducedMotion } from "./gsap-config";
import { useLenis } from "./useLenis";
import ScrollVideoScrubber from "./ScrollVideoScrubber";

const CALENDLY_URL = "#";

// Feature flag for the cube-rotation scroll-scrub video background.
// Flip to false to instantly roll back to the old static hero photo —
// the original markup below stays intact either way.
const SCROLL_SCRUB_ENABLED = true;

const STEP_BORDER_REST = "rgba(255,255,255,0.14)";
const STEP_BORDER_ACTIVE = "rgba(255,255,255,0.55)";
const STEP_GLOW_REST = "0 0 0 rgba(0,0,0,0)";
const STEP_GLOW_ACTIVE =
  "0 0 32px rgba(255,255,255,0.14), 0 8px 24px rgba(0,0,0,0.35)";

const PILLARS: { badge: string; title: string; text: string; image?: string }[] = [
  {
    badge: "Säule 01",
    title: "Werbung",
    text: "Meta und Google Ads, die aus Klicks Buchungen und Bestellungen machen. Aufgesetzt, betreut und laufend verbessert — ohne dass du dich darum kümmerst.",
    image: werbungImg,
  },
  {
    badge: "Säule 02",
    title: "Content",
    text: "Social Media und Videoinhalte mit Plan. Wir liefern Strategie, Skripte und Drehpläne — gefilmt wird so, wie es für dich am besten passt.",
    image: contentImg,
  },
  {
    badge: "Säule 03",
    title: "Umsatz",
    text: "E-Mail-Marketing, Automatisierung und klare Zahlen. Du siehst jeden Monat schwarz auf weiss, was deine Werbung gebracht hat.",
    image: umsatzImg,
  },
];

const STEPS = [
  {
    nr: "01",
    title: "Gespräch",
    text: "Wir schauen uns dein Geschäft an und zeigen dir, wo mehr drin ist. Unverbindlich, ehrlich, 30 Minuten.",
  },
  {
    nr: "02",
    title: "Aufbau",
    text: "Wir bauen alles auf — Werbung, Content, E-Mails. Du gibst einmal dein Okay, mehr braucht es von dir nicht.",
  },
  {
    nr: "03",
    title: "Wachstum",
    text: "Dein Marketing läuft. Du bekommst klare Berichte und mehr Buchungen — wir kümmern uns um den Rest.",
  },
];

function LogoLockup() {
  return (
    <span className="cv-logo">
      CalvinVisuals
      <span className="cv-logo-bars" aria-hidden="true">
        <i /> <i /> <i />
      </span>
    </span>
  );
}

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useLenis(true);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      // Hero: dezenter Scale/Fade beim Rausscrollen
      gsap.to(heroRef.current, {
        scale: 1.08,
        opacity: 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Generische Staggered Reveals für alle Card-/Text-Gruppen
      const groups = gsap.utils.toArray<HTMLElement>("[data-reveal-group]");
      groups.forEach((group) => {
        const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 32,
          duration: DURATION.base,
          ease: EASE,
          stagger: 0.15,
          scrollTrigger: {
            trigger: group,
            start: "top 82%",
          },
        });
      });

      // Ablauf: Glass-Karten, immer sichtbar — Ränder leuchten nacheinander
      // auf, sobald die Sektion in den Viewport scrollt (einmalig).
      const steps = gsap.utils.toArray<HTMLElement>("#ablauf .cv-step");
      gsap.set(steps, {
        borderColor: STEP_BORDER_REST,
        boxShadow: STEP_GLOW_REST,
        scale: 1,
        y: 0,
      });

      if (steps.length) {
        ScrollTrigger.create({
          trigger: "#ablauf .cv-steps",
          start: "top 80%",
          once: true,
          onEnter: () => {
            steps.forEach((step, i) => {
              gsap.to(step, {
                borderColor: STEP_BORDER_ACTIVE,
                boxShadow: STEP_GLOW_ACTIVE,
                scale: 1.03,
                duration: 0.6,
                ease: "power2.out",
                delay: i * 0.2,
                onComplete: () => {
                  step.dataset.revealed = "true";
                },
              });
            });
          },
        });
      }
    }, rootRef);

    // Hover-Interaktion für die Ablauf-Karten (ausserhalb des GSAP-Context,
    // damit die Listener bei jedem Effect-Cleanup sauber entfernt werden).
    const stepEls = gsap.utils.toArray<HTMLElement>("#ablauf .cv-step");
    const stepListeners: Array<{
      el: HTMLElement;
      onEnter: () => void;
      onLeave: () => void;
    }> = [];

    const canHover =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!prefersReducedMotion() && canHover) {
      stepEls.forEach((step) => {
        const onEnter = () => {
          gsap.to(step, {
            borderColor: STEP_BORDER_ACTIVE,
            boxShadow: STEP_GLOW_ACTIVE,
            scale: 1.03,
            y: -4,
            duration: DURATION.fast,
            ease: "power2.out",
          });
        };
        const onLeave = () => {
          const revealed = step.dataset.revealed === "true";
          gsap.to(step, {
            borderColor: revealed ? STEP_BORDER_ACTIVE : STEP_BORDER_REST,
            boxShadow: revealed ? STEP_GLOW_ACTIVE : STEP_GLOW_REST,
            scale: revealed ? 1.03 : 1,
            y: 0,
            duration: DURATION.fast,
            ease: "power2.out",
          });
        };
        step.addEventListener("mouseenter", onEnter);
        step.addEventListener("mouseleave", onLeave);
        stepListeners.push({ el: step, onEnter, onLeave });
      });
    }

    return () => {
      ctx.revert();
      stepListeners.forEach(({ el, onEnter, onLeave }) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <div className="cv-root" ref={rootRef}>
      <style>{css}</style>

      {SCROLL_SCRUB_ENABLED && <ScrollVideoScrubber poster={heroImg} />}

      {/* ── Navigation ─────────────────────────────── */}
      <header className="cv-nav">
        <LogoLockup />
        <a className="cv-btn cv-btn--ghost" href={CALENDLY_URL}>
          Gespräch buchen
        </a>
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="cv-hero" ref={heroRef}>
        {!SCROLL_SCRUB_ENABLED && (
          <>
            <img className="cv-hero-img" src={heroImg} alt="" />
            <div className="cv-hero-scrim" />
          </>
        )}
        <div className="cv-hero-content">
          <span className="cv-eyebrow">CalvinVisuals</span>
          <h1 className="cv-display">
            Du kümmerst dich um dein Geschäft.
            <br />
            Wir um deinen Wachstum.
          </h1>
          <p className="cv-hero-sub">Massgeschneidert für mehr Umsatz.</p>
          <div className="cv-hero-actions">
            <a className="cv-btn cv-btn--primary" href={CALENDLY_URL}>
              Gespräch buchen <span aria-hidden="true">→</span>
            </a>
            <a className="cv-btn cv-btn--ghost" href="#ablauf">
              So arbeiten wir
            </a>
          </div>
        </div>
      </section>

      <main className="cv-main">
        {/* ── Problem ──────────────────────────────── */}
        <section className="cv-section cv-center" data-reveal-group>
          <span className="cv-eyebrow" data-reveal-item>
            Problem
          </span>
          <h2 className="cv-heading-lg" data-reveal-item>
            Du weisst, dass mehr drin wäre.
          </h2>
          <p className="cv-body cv-measure" data-reveal-item>
            Dein Geschäft läuft. Aber Werbung, Content, E-Mails — dafür bleibt
            am Ende des Tages keine Zeit. Genau dort übernehmen wir.
          </p>
        </section>

        {/* ── Drei Säulen ──────────────────────────── */}
        <section className="cv-section">
          <div data-reveal-group className="cv-center-text">
            <span className="cv-eyebrow" data-reveal-item>
              Angebot
            </span>
            <h2 className="cv-heading-lg cv-center-text" data-reveal-item>
              Alles aus einer Hand.
            </h2>
          </div>
          <div className="cv-grid-3" data-reveal-group>
            {PILLARS.map((p) => (
              <article
                key={p.title}
                className={`cv-card ${p.image ? "cv-card--image" : ""}`}
                data-reveal-item
                style={
                  p.image ? { backgroundImage: `url(${p.image})` } : undefined
                }
              >
                <span className="cv-badge">{p.badge}</span>
                <div className="cv-card-body">
                  <h3 className="cv-subheading">{p.title}</h3>
                  <p className="cv-body-sm">{p.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Ablauf ───────────────────────────────── */}
        <section className="cv-section" id="ablauf">
          <div data-reveal-group className="cv-center-text">
            <span className="cv-eyebrow" data-reveal-item>
              Ablauf
            </span>
            <h2 className="cv-heading-lg cv-center-text" data-reveal-item>
              So einfach läuft's.
            </h2>
          </div>
          <div className="cv-steps">
            {STEPS.map((s) => (
              <div className="cv-step" key={s.nr}>
                <span className="cv-step-nr">{s.nr}</span>
                <div>
                  <h3 className="cv-subheading">{s.title}</h3>
                  <p className="cv-body-sm">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Warum wir ────────────────────────────── */}
        <section className="cv-section cv-founder" data-reveal-group>
          <figure className="cv-founder-card" data-reveal-item>
            <img src={calvinImg} alt="Calvin, Gründer von CalvinVisuals" />
            <figcaption>
              <span className="cv-badge">Gründer</span>
              <span className="cv-founder-name">Calvin · CalvinVisuals</span>
            </figcaption>
          </figure>
          <div className="cv-founder-text" data-reveal-item>
            <span className="cv-eyebrow">Warum wir</span>
            <h2 className="cv-heading-lg">
              Wir verdienen nur richtig, wenn du mehr verdienst.
            </h2>
            <p className="cv-body">
              Unsere Bezahlung orientiert sich an deinem Erfolg. Das heisst:
              Wir arbeiten nicht für Stunden, sondern für Resultate — und
              haben denselben Grund wie du, dass dein Umsatz wächst. Details
              besprechen wir persönlich.
            </p>
            <a className="cv-btn cv-btn--primary" href={CALENDLY_URL}>
              Gespräch buchen <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      {/* ── Abschluss (Linen-Panel) ────────────────── */}
      <section className="cv-linen" data-reveal-group>
        <h2 className="cv-heading-lg cv-linen-title" data-reveal-item>
          Bereit für mehr Umsatz?
        </h2>
        <p className="cv-body cv-linen-body cv-measure" data-reveal-item>
          Ein Gespräch reicht, um zu sehen, ob wir zusammenpassen. Kostenlos,
          unverbindlich, ehrlich.
        </p>
        <a className="cv-btn cv-btn--dark" href={CALENDLY_URL} data-reveal-item>
          Gespräch buchen <span aria-hidden="true">→</span>
        </a>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="cv-footer">
        <LogoLockup />
        <span className="cv-caption">© 2026 CalvinVisuals</span>
      </footer>
    </div>
  );
}

/* ============================================================ */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@300;400;500&display=swap');

.cv-root {
  --void: #000000;
  --carbon: #202020;
  --graphite: #333333;
  --bone: #c0c0c0;
  --smoke: #999999;
  --chalk: #ffffff;
  --linen: #f5f5f0;
  --serif: 'Instrument Serif', Georgia, serif;
  --sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --max: 1280px;
  --gap: 96px;
  --shadow-xl: rgba(0,0,0,0.35) 0px 10px 30px 0px, rgba(255,255,255,0.08) 0px 1px 0px 0px inset;
  --shadow-lg: rgba(0,0,0,0.15) 0px 4px 20px 0px;
  --dur-fast: 0.3s;
  --ease: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --dur-lift-btn: 0.25s;
  --dur-lift-card: 0.3s;
  --dur-shine-btn: 0.7s;
  --dur-shine-card: 1s;

  background: var(--void);
  color: var(--chalk);
  font-family: var(--sans);
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  position: relative;
  z-index: 0;
}
.cv-root * { box-sizing: border-box; margin: 0; }

/* ── Scroll-Scrub Video-Hintergrund ── */
.cv-scrollbg {
  position: fixed; inset: 0; z-index: -1;
  overflow: hidden;
}
.cv-scrollbg-media {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; filter: saturate(0.55);
}
.cv-scrollbg-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.6);
}

/* ── Typografie ── */
.cv-display {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(44px, 8.5vw, 118px);
  line-height: 1.0;
  letter-spacing: -0.05em;
  color: var(--chalk);
}
.cv-heading-lg {
  font-family: var(--serif);
  font-weight: 500;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.15;
  letter-spacing: -0.04em;
  color: var(--chalk);
}
.cv-eyebrow {
  display: inline-block;
  margin-bottom: 12px;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--smoke);
}
.cv-subheading {
  font-size: 22px; font-weight: 500; letter-spacing: -0.02em;
  line-height: 1.3; color: var(--chalk);
}
.cv-body { font-size: 18px; line-height: 1.5; letter-spacing: -0.02em; color: var(--bone); }
.cv-body-sm { font-size: 15px; line-height: 1.55; letter-spacing: -0.015em; color: var(--smoke); }
.cv-caption { font-size: 12px; letter-spacing: 0.03em; color: var(--smoke); }
.cv-measure { max-width: 560px; }
.cv-center-text { text-align: center; }

/* ── Buttons ── */
.cv-btn {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; gap: 8px;
  border-radius: 9999px; padding: 16px 24px;
  font-family: var(--sans); font-size: 15px; font-weight: 500;
  letter-spacing: -0.02em; text-decoration: none; white-space: nowrap;
  will-change: transform;
  transition: transform var(--dur-lift-btn) var(--ease-out), background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
}
.cv-btn::before {
  content: "";
  position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%);
  transform: translateX(-150%);
  transition: transform var(--dur-shine-btn) var(--ease-out);
  pointer-events: none;
}
.cv-btn:focus-visible { outline: 2px solid var(--chalk); outline-offset: 3px; }
.cv-btn--primary { background: var(--chalk); color: var(--void); box-shadow: var(--shadow-lg); }
.cv-btn--primary::before { background: linear-gradient(115deg, transparent 40%, rgba(0,0,0,0.08) 50%, transparent 60%); }
.cv-btn--primary:hover { background: var(--linen); }
.cv-btn--ghost { background: transparent; color: var(--chalk); border: 1px solid rgba(255,255,255,0.5); }
.cv-btn--ghost:hover { border-color: var(--chalk); }
.cv-btn--dark { background: var(--void); color: var(--linen); box-shadow: var(--shadow-lg); }

@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .cv-btn:hover { transform: translateY(-2px) scale(1.02); }
  .cv-btn:hover::before { transform: translateX(150%); }
}

.cv-btn:active { transform: scale(0.98); }

/* ── Logo ── */
.cv-logo {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: var(--sans); font-weight: 400; font-size: 20px;
  letter-spacing: -0.02em; color: currentColor;
}
.cv-logo-bars { display: inline-flex; gap: 3px; }
.cv-logo-bars i { display: block; width: 2px; height: 14px; background: currentColor; }

/* ── Navigation ── */
.cv-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  height: 72px; padding: 0 20px;
  max-width: var(--max); margin: 0 auto;
  color: var(--chalk);
}

/* ── Hero ── */
.cv-hero {
  position: relative; min-height: 100svh; margin-top: -72px; display: flex;
  transform-origin: center center;
  will-change: transform;
}
.cv-hero-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; filter: saturate(0.55);
}
.cv-hero-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.55) 100%);
}
.cv-hero-content {
  position: relative; z-index: 1;
  width: 100%; max-width: var(--max); margin: 0 auto;
  padding: 0 20px 88px;
  display: flex; flex-direction: column; justify-content: flex-end; gap: 24px;
}
.cv-hero-sub { font-size: 18px; letter-spacing: -0.02em; color: var(--bone); }
.cv-hero-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; }

/* ── Layout ── */
.cv-main { max-width: var(--max); margin: 0 auto; padding: 0 20px; }
.cv-section { padding-top: var(--gap); }
.cv-section:last-child { padding-bottom: var(--gap); }
.cv-center { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 24px; }

/* ── Säulen-Karten ── */
.cv-grid-3 {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px; margin-top: 48px;
}
.cv-card {
  position: relative; display: flex; flex-direction: column;
  justify-content: space-between; gap: 64px;
  min-height: 380px; padding: 19px;
  background: var(--carbon); border-radius: 10px;
  box-shadow: var(--shadow-xl);
  background-size: cover; background-position: center;
  overflow: hidden;
  will-change: transform;
  transition: transform var(--dur-lift-card) var(--ease-out);
}
.cv-card::before {
  content: "";
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.18) 50%, transparent 75%);
  transform: translateX(-150%);
  transition: transform var(--dur-shine-card) var(--ease-out);
  pointer-events: none;
}
.cv-card--image {
  filter: saturate(0.55);
}
.cv-card--image::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1) 60%);
}
.cv-card > * { position: relative; z-index: 1; }
.cv-card-body { display: flex; flex-direction: column; gap: 10px; }
.cv-badge {
  align-self: flex-start;
  background: rgba(255,255,255,0.08);
  box-shadow: rgba(255,255,255,0.08) 0 1px 0 inset;
  border-radius: 9999px; padding: 5px 11px;
  font-size: 11px; font-weight: 500; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--chalk);
}

/* ── Ablauf ── */
.cv-steps {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px; margin-top: 48px;
}
.cv-step {
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: 20px;
  padding: 32px 24px;
  border-radius: 22px;
  background: rgba(255,255,255,0.045);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.14);
  transform-origin: center center;
  will-change: transform, border-color, box-shadow;
}
.cv-step::before {
  content: "";
  position: absolute; inset: 0; z-index: -1;
  background: linear-gradient(115deg, transparent 25%, rgba(255,255,255,0.18) 50%, transparent 75%);
  transform: translateX(-150%);
  transition: transform var(--dur-shine-card) var(--ease-out);
  pointer-events: none;
}
.cv-step-nr {
  font-family: var(--serif); font-size: 32px; line-height: 1;
  color: var(--smoke); letter-spacing: -0.02em;
}
.cv-step .cv-subheading { margin-bottom: 8px; }

@media (max-width: 640px) {
  .cv-step {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: rgba(255,255,255,0.06);
  }
}

/* ── Karten-Hover: Shine + Lift (nur echte Hover-Geräte, respektiert reduced-motion) ── */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .cv-card:hover { transform: translateY(-4px) scale(1.02); }
  .cv-card:hover::before { transform: translateX(150%); }
  .cv-step:hover::before { transform: translateX(150%); }
}

/* ── Founder ── */
.cv-founder {
  display: grid; grid-template-columns: 5fr 7fr;
  gap: 64px; align-items: center;
}
.cv-founder-card {
  position: relative; border-radius: 10px; overflow: hidden;
  box-shadow: var(--shadow-xl); aspect-ratio: 4/5;
}
.cv-founder-card img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  filter: saturate(0.6);
}
.cv-founder-card figcaption {
  position: absolute; inset: auto 0 0 0; padding: 19px;
  display: flex; justify-content: space-between; align-items: flex-end;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}
.cv-founder-name { font-size: 14px; font-weight: 500; color: var(--chalk); letter-spacing: -0.01em; }
.cv-founder-text { display: flex; flex-direction: column; gap: 24px; align-items: flex-start; }

/* ── Linen-Panel ── */
.cv-linen {
  margin-top: var(--gap);
  background: var(--linen); color: var(--void);
  padding: var(--gap) 20px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 24px;
}
.cv-linen-title { color: var(--void); }
.cv-linen-body { color: var(--graphite); }

/* ── Footer ── */
.cv-footer {
  max-width: var(--max); margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  padding: 40px 20px; color: var(--chalk);
}

@media (prefers-reduced-motion: reduce) {
  .cv-btn { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .cv-grid-3, .cv-steps { grid-template-columns: 1fr; }
  .cv-founder { grid-template-columns: 1fr; gap: 40px; }
  .cv-founder-card { max-width: 420px; }
  .cv-root { --gap: 72px; }
}
`;
