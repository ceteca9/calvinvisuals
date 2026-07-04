import { useLayoutEffect, useRef, useState } from "react";
import cubeRotationVideo from "./assets/cube-rotation.mp4";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap-config";

export default function ScrollVideoScrubber({ poster }: { poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
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

    const video = videoRef.current;
    if (!video) return;

    // Manche Browser lassen currentTime-Seeks erst nach einem echten
    // Play-Zyklus zuverlässig zu ("Decoder aufwecken").
    video.play().then(() => video.pause()).catch(() => {});

    let targetProgress = 0;
    let currentProgress = 0;
    let lastSetTime = -1;

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        targetProgress = self.progress;
      },
    });

    const tick = () => {
      currentProgress += (targetProgress - currentProgress) * 0.08;
      const duration = video.duration;
      if (duration && !Number.isNaN(duration)) {
        const t = currentProgress * duration;
        if (Math.abs(t - lastSetTime) > 0.01) {
          video.currentTime = t;
          lastSetTime = t;
        }
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
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
    <div className="cv-scrollbg">
      <video
        ref={videoRef}
        className="cv-scrollbg-media"
        src={cubeRotationVideo}
        poster={poster}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="cv-scrollbg-overlay" />
    </div>
  );
}
