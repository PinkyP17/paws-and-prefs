// src/app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  animate,
} from "framer-motion";
import { Heart, X, Sparkles, Undo2 } from "lucide-react";
import { useCats, type Cat } from "@/hooks/useCats";
// import { useSound } from "@/hooks/useSound"; // TODO: fix Web Audio API sound
import MatchSummary from "@/components/MatchSummary";

const exitVariants = {
  exit: (direction: number) => ({
    x: direction,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  }),
};

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

// ─── Swipe hint ───────────────────────────────────────────────────────────────
function useSwipeHint(x: ReturnType<typeof useMotionValue>, enabled: boolean) {
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

// ─── Isolated card ────────────────────────────────────────────────────────────
function SwipeCard({
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

// ─── Action button ────────────────────────────────────────────────────────────
function ActionButton({
  onClick,
  isLike,
  disabled,
}: {
  onClick: () => void;
  isLike: boolean;
  disabled?: boolean;
}) {
  const [burst, setBurst] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setBurst(true);
    onClick();
    setTimeout(() => setBurst(false), 400);
  };

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {burst && (
          <motion.span
            key="burst"
            className={`absolute inset-0 rounded-full ${isLike ? "bg-indigo-400" : "bg-rose-400"}`}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      <motion.button
        onClick={handleClick}
        whileTap={disabled ? {} : { scale: 0.82 }}
        whileHover={disabled ? {} : { scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`relative w-16 h-16 flex items-center justify-center rounded-full shadow-xl transition-all ${
          disabled ? "opacity-30 cursor-not-allowed" : ""
        } ${
          isLike
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
            : "bg-white hover:bg-rose-50 text-rose-500 border border-slate-100"
        }`}
      >
        {isLike ? (
          <Heart strokeWidth={2.5} fill="currentColor" size={30} />
        ) : (
          <X strokeWidth={3} size={30} />
        )}
      </motion.button>
      <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {isLike ? "Like" : "Pass"}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type SwipeRecord = {
  cat: Cat;
  index: number;
  isLiked: boolean;
};

export default function Home() {
  const { cats, isLoading } = useCats(10);
  const [likedCats, setLikedCats] = useState<Cat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showSummary, setShowSummary] = useState(false);
  const [history, setHistory] = useState<SwipeRecord[]>([]);

  const isSwipingRef = useRef(false);
  const hasInitialized = useRef(false);
  const exitDirectionRef = useRef(0);
  // Track preload promises by URL — lets us await all liked images before showing summary
  const preloadPromisesRef = useRef<Map<string, Promise<void>>>(new Map());

  if (cats.length > 0 && !hasInitialized.current) {
    hasInitialized.current = true;
    setCurrentIndex(cats.length - 1);
  }

  useEffect(() => {
    if (!isLoading && cats.length > 0 && currentIndex === -1 && !showSummary) {
      // Wait for all liked image preloads to finish before showing summary
      const pending = Array.from(preloadPromisesRef.current.values());
      Promise.all(pending).then(() => {
        setTimeout(() => setShowSummary(true), 350);
      });
    }
  }, [currentIndex, isLoading, cats.length, showSummary]);

  const handleSwipe = (isLiked: boolean, index: number) => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;

    exitDirectionRef.current = isLiked ? 600 : -600;

    const cat = cats[index];
    setHistory((prev) => [...prev, { cat, index, isLiked }]);

    if (isLiked) {
      setLikedCats((prev) => [...prev, cat]);
      // Store the promise so we can await it before showing the summary
      if (!preloadPromisesRef.current.has(cat.imageUrl)) {
        preloadPromisesRef.current.set(
          cat.imageUrl,
          preloadImage(cat.imageUrl),
        );
      }
    }

    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 350);
  };

  const handleUndo = () => {
    if (isSwipingRef.current || history.length === 0) return;
    isSwipingRef.current = true;

    const last = history[history.length - 1];

    if (last.isLiked) {
      setLikedCats((prev) => prev.filter((c) => c.id !== last.cat.id));
      preloadPromisesRef.current.delete(last.cat.imageUrl);
    }

    exitDirectionRef.current = last.isLiked ? -600 : 600;
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => prev + 1);

    setTimeout(() => {
      isSwipingRef.current = false;
    }, 350);
  };

  const handleActionClick = (isLiked: boolean) => {
    if (isSwipingRef.current || currentIndex < 0) return;
    handleSwipe(isLiked, currentIndex);
  };

  const progress =
    cats.length > 0
      ? ((cats.length - 1 - currentIndex) / cats.length) * 100
      : 0;

  const isFirstCard = history.length === 0 && currentIndex === cats.length - 1;

  return (
    <main className="relative flex flex-col min-h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 blur-[120px] rounded-full pointer-events-none" />

      <header className="flex flex-col gap-4 px-6 pt-6 pb-2 z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              Paws & Prefs
            </h1>
          </div>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            {currentIndex >= 0 ? `${currentIndex + 1} TO GO` : "FINISHED"}
          </div>
        </div>

        <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
          />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 relative">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
              <Heart
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse"
                size={24}
                fill="currentColor"
              />
            </div>
            <p className="text-slate-500 font-bold tracking-wide uppercase text-sm">
              Fetching kitty magic...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!showSummary ? (
              <motion.div
                key="cards"
                className="flex flex-col items-center w-full max-w-[400px] h-full justify-center gap-8"
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  y: -24,
                  transition: { duration: 0.35, ease: "easeIn" },
                }}
              >
                <div className="relative w-full aspect-[4/5] sm:aspect-[3/4]">
                  <AnimatePresence custom={exitDirectionRef.current}>
                    {cats.map((cat, index) => {
                      if (
                        currentIndex < 0 ||
                        index > currentIndex ||
                        index < currentIndex - 2
                      )
                        return null;
                      const isTopCard = index === currentIndex;

                      return (
                        <motion.div
                          key={cat.id}
                          className="absolute w-full h-full"
                          custom={exitDirectionRef.current}
                          variants={exitVariants}
                          exit="exit"
                          initial={{
                            x:
                              isTopCard &&
                              history.length > 0 &&
                              history[history.length - 1]?.index === index
                                ? exitDirectionRef.current * -1
                                : 0,
                            opacity:
                              isTopCard &&
                              history.length > 0 &&
                              history[history.length - 1]?.index === index
                                ? 0
                                : 1,
                          }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <SwipeCard
                            cat={cat}
                            index={index}
                            currentIndex={currentIndex}
                            isTopCard={isTopCard}
                            isFirstEver={isFirstCard && isTopCard}
                            onSwipe={(isLiked) => handleSwipe(isLiked, index)}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-center gap-6 w-full mt-2">
                  <ActionButton
                    onClick={() => handleActionClick(false)}
                    isLike={false}
                    disabled={currentIndex < 0}
                  />

                  <motion.button
                    onClick={handleUndo}
                    whileTap={history.length > 0 ? { scale: 0.85 } : {}}
                    whileHover={history.length > 0 ? { scale: 1.1 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    disabled={history.length === 0}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      history.length === 0
                        ? "opacity-25 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-md border border-slate-100 text-slate-500">
                      <Undo2 size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Undo
                    </span>
                  </motion.button>

                  <ActionButton
                    onClick={() => handleActionClick(true)}
                    isLike={true}
                    disabled={currentIndex < 0}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                className="w-full flex justify-center"
                initial={{ opacity: 0, y: 48, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <MatchSummary likedCats={likedCats} totalCats={cats.length} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <footer className="py-6 flex justify-center opacity-30 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
          Paws & Preferences v1.0
        </p>
      </footer>
    </main>
  );
}
