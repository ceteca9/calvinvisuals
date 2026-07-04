import { useLayoutEffect, useRef, useState } from "react";
import cubeRotationVideo from "./assets/cube-rotation.mp4";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap-config";

// Luminance keying: the video's void background sits around lum ~4-7,
// the darkest real subject content (floor/chairs) sits at ~20+ — measured
// on the actual footage, so this range safely cuts only the void.
const KEY_LOW = 10;
const KEY_HIGH = 22;
const MAX_CANVAS_WIDTH = 1280;

export default function ScrollVideoScrubber({ poster }: { poster: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useStatic, setUseStatic] = useState(false);

  useLayoutEffect(() => {
    const isSmallScreen = window.innerWidth < 768;
    const reducedMotion = prefersReducedMotion();
    if (reducedMotion || isSmallScreen) {
      if (import.meta.env.DEV) {
        console.info(
          `[ScrollVideoScrubber] Static-Fallback aktiv (reducedMotion=${reducedMotion}, innerWidth=${window.innerWidth}px < 768px=${isSmallScreen}) — Video wird nicht gescrubbt.`
        );
      }
      setUseStatic(true);
      return;
    }

    const container = containerRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!container || !video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Manche Browser lassen currentTime-Seeks erst nach einem echten
    // Play-Zyklus zuverlässig zu ("Decoder aufwecken").
    video.play().then(() => video.pause()).catch(() => {});

    function resizeCanvas() {
      const rect = container!.getBoundingClientRect();
      const scale = Math.min(1, MAX_CANVAS_WIDTH / rect.width);
      canvas!.width = Math.max(1, Math.round(rect.width * scale));
      canvas!.height = Math.max(1, Math.round(rect.height * scale));
      drawKeyedFrame();
    }

    // Schneidet den Void-Hintergrund per Helligkeits-Schwelle aus dem Frame
    // heraus (Alpha=0), sodass die echte, bandingfreie CSS-Schwarzfläche
    // der Seite durchscheint statt komprimierter Video-Pixel.
    function drawKeyedFrame() {
      const sw = video!.videoWidth;
      const sh = video!.videoHeight;
      const cw = canvas!.width;
      const ch = canvas!.height;
      if (!sw || !sh || !cw || !ch) return;

      const sourceRatio = sw / sh;
      const canvasRatio = cw / ch;
      let dw: number, dh: number, dx: number, dy: number;
      if (sourceRatio > canvasRatio) {
        dh = ch;
        dw = dh * sourceRatio;
        dx = (cw - dw) / 2;
        dy = 0;
      } else {
        dw = cw;
        dh = dw / sourceRatio;
        dx = 0;
        dy = (ch - dh) / 2;
      }

      ctx!.clearRect(0, 0, cw, ch);
      ctx!.drawImage(video!, dx, dy, dw, dh);
      const frame = ctx!.getImageData(0, 0, cw, ch);
      const d = frame.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        if (lum <= KEY_LOW) {
          d[i + 3] = 0;
        } else if (lum < KEY_HIGH) {
          d[i + 3] = Math.round(((lum - KEY_LOW) / (KEY_HIGH - KEY_LOW)) * 255);
        }
      }
      ctx!.putImageData(frame, 0, 0);
    }

    let targetProgress = 0;
    let currentProgress = 0;
    let lastDrawnTime = -1;

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        targetProgress = self.progress;
      },
    });

    // Web-Fonts und Bilder verändern die Dokumenthöhe oft erst NACH dem
    // ersten Layout — ScrollTrigger cacht Start/Ende beim Erstellen, also
    // muss nach dem tatsächlichen Settle neu gemessen werden, sonst stimmt
    // die Scroll-Zuordnung nicht mehr (fühlt sich an wie "Scroll tut nichts").
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh);
    }
    const refreshTimeout = window.setTimeout(refresh, 1000);

    video.addEventListener("seeked", drawKeyedFrame);
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);
    resizeCanvas();

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.08;
      const duration = video.duration;
      if (duration && !Number.isNaN(duration)) {
        const t = currentProgress * duration;
        if (Math.abs(t - lastDrawnTime) > 0.02) {
          lastDrawnTime = t;
          video.currentTime = t;
        }
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
      video.removeEventListener("seeked", drawKeyedFrame);
      window.removeEventListener("load", refresh);
      window.clearTimeout(refreshTimeout);
    };
  }, []);

  if (useStatic) {
    return (
      <div className="cv-scrollbg">
        <img className="cv-scrollbg-media" src={poster} alt="" />
        <div className="cv-scrollbg-overlay" />
      </div>
    );
  }

  return (
    <div className="cv-scrollbg" ref={containerRef}>
      <video
        ref={videoRef}
        src={cubeRotationVideo}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} className="cv-scrollbg-media" aria-hidden="true" />
      <div className="cv-scrollbg-overlay" />
    </div>
  );
}
