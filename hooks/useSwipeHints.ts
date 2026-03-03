import { useEffect } from "react";
import { animate, MotionValue } from "framer-motion";

export function useSwipeHint(x: MotionValue<number>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const runHint = () =>
      animate(x, [0, 60, -60, 0], { duration: 1.2, ease: "easeInOut" });

    const initial = setTimeout(runHint, 800);
    const interval = setInterval(runHint, 5000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [enabled, x]);
}
