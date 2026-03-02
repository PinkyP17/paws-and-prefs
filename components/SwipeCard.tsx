import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Cat } from "@/hooks/useCats";
import { useSwipeHint } from "@/hooks/useSwipeHints";

export default function SwipeCard({
  cat,
  index,
  currentIndex,
  isTopCard,
  isFirstEver,
  onSwipe,
}: {
  cat: Cat;
  index: number;
  currentIndex: number;
  isTopCard: boolean;
  isFirstEver: boolean;
  onSwipe: (isLiked: boolean) => void;
}) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -80], [0, 1]);
  const likeScale = useTransform(x, [0, 80], [0.5, 1]);
  const nopeScale = useTransform(x, [0, -80], [0.5, 1]);

  useSwipeHint(x, isTopCard && isFirstEver);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) onSwipe(true);
    else if (info.offset.x < -threshold) onSwipe(false);
  };

  return (
    <motion.div
      className="absolute w-full h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing origin-bottom border-4 border-white"
      style={{
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : 0,
        scale: isTopCard ? 1 : 1 - (currentIndex - index) * 0.05,
        y: isTopCard ? 0 : (currentIndex - index) * 15,
        zIndex: index,
      }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
    >
      {isTopCard && (
        <>
          <motion.div
            style={{ opacity: nopeOpacity, scale: nopeScale }}
            className="absolute top-10 right-8 border-[6px] border-rose-500 text-rose-500 font-black text-4xl px-6 py-2 rounded-2xl rotate-12 z-10 bg-white/10 backdrop-blur-md pointer-events-none tracking-tighter"
          >
            NOPE
          </motion.div>
          <motion.div
            style={{ opacity: likeOpacity, scale: likeScale }}
            className="absolute top-10 left-8 border-[6px] border-emerald-500 text-emerald-500 font-black text-4xl px-6 py-2 rounded-2xl -rotate-12 z-10 bg-white/10 backdrop-blur-md pointer-events-none tracking-tighter"
          >
            LIKE
          </motion.div>
        </>
      )}

      {isTopCard && isFirstEver && (
        <motion.div
          className="absolute bottom-28 left-0 right-0 flex justify-center pointer-events-none z-20"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full tracking-widest uppercase">
            ← Swipe to decide →
          </span>
        </motion.div>
      )}

      {!isImageLoaded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-0">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-400 rounded-full animate-spin" />
        </div>
      )}

      <img
        src={cat.imageUrl}
        alt={cat.tag}
        onLoad={() => setIsImageLoaded(true)}
        className={`w-full h-full object-cover pointer-events-none select-none transition-opacity duration-300 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-32 pb-10 px-8 pointer-events-none transition-opacity duration-300 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mb-1">
              Candidate
            </p>
            <h2 className="text-white text-4xl font-black tracking-tight">
              Kitty #{index + 1}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-sm font-bold">
            <span>{cat.emoji}</span>
            <span>{cat.tag}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
