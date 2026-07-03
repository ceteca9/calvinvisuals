import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "./gsap-config";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(0);
  const [skip] = useState(prefersReducedMotion);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (skip) {
      onComplete();
      return;
    }

    document.body.style.overflow = "hidden";
    const counter = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setDone(true);
        onComplete();
      },
    });

    tl.to(counter, {
      value: 100,
      duration: 2.2,
      ease: "power1.inOut",
      onUpdate: () => setPct(Math.floor(counter.value)),
    }).to(
      overlayRef.current,
      { yPercent: -100, duration: 1, ease: "power4.inOut" },
      "+=0.15"
    );

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (skip || done) return null;

  return (
    <div ref={overlayRef} className="cv-preloader">
      <span className="cv-preloader-count">{pct}%</span>
    </div>
  );
}
