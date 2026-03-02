// src/app/page.tsx
"use client";

import { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import { useCats } from "@/hooks/useCats";
import MatchSummary from "@/components/MatchSummary";

// Exit variant reads `custom` synchronously at the moment the card leaves —
// no async state timing issues.
const exitVariants = {
  exit: (direction: number) => ({
    x: direction,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  }),
};

// ─── Isolated card — owns its own x motion value ─────────────────────────────
function SwipeCard({
  cat,
  index,
  currentIndex,
  isTopCard,
  onSwipe,
}: {
  cat: { id: string; imageUrl: string };
  index: number;
  currentIndex: number;
  isTopCard: boolean;
  onSwipe: (isLiked: boolean) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -80], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe(true);
    } else if (info.offset.x < -threshold) {
      onSwipe(false);
    }
  };

  return (
    <motion.div
      className="absolute w-full h-full bg-white rounded-[2rem] shadow-xl overflow-hidden cursor-grab active:cursor-grabbing origin-bottom border border-slate-100"
      style={{
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : 0,
        scale: isTopCard ? 1 : 1 - (currentIndex - index) * 0.04,
        y: isTopCard ? 0 : (currentIndex - index) * 12,
        zIndex: index,
      }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
    >
      {isTopCard && (
        <>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-6 right-6 border-[3px] border-rose-500 text-rose-500 font-black text-3xl px-4 py-1 rounded-xl rotate-12 z-10 bg-white/80 backdrop-blur-sm pointer-events-none"
          >
            NOPE
          </motion.div>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 left-6 border-[3px] border-emerald-500 text-emerald-500 font-black text-3xl px-4 py-1 rounded-xl -rotate-12 z-10 bg-white/80 backdrop-blur-sm pointer-events-none"
          >
            LIKE
          </motion.div>
        </>
      )}
      <img
        src={cat.imageUrl}
        alt="Cat candidate"
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent pt-16 pb-6 px-6 pointer-events-none">
        <h2 className="text-white text-3xl font-bold">Kitty #{index + 1}</h2>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const { cats, isLoading } = useCats(10);
  const [likedCats, setLikedCats] = useState<
    { id: string; imageUrl: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const isSwipingRef = useRef(false);
  const hasInitialized = useRef(false);
  // Ref instead of state — always in sync when AnimatePresence reads it
  const exitDirectionRef = useRef(0);

  if (cats.length > 0 && !hasInitialized.current) {
    hasInitialized.current = true;
    setCurrentIndex(cats.length - 1);
  }

  const handleSwipe = (isLiked: boolean, index: number) => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;

    // Write the ref synchronously BEFORE triggering the state update
    // so AnimatePresence reads the correct value during this render.
    exitDirectionRef.current = isLiked ? 600 : -600;

    if (isLiked) {
      setLikedCats((prev) => [...prev, cats[index]]);
    }
    setCurrentIndex((prev) => prev - 1);

    setTimeout(() => {
      isSwipingRef.current = false;
    }, 350);
  };

  const handleActionClick = (isLiked: boolean) => {
    if (isSwipingRef.current || currentIndex < 0) return;
    handleSwipe(isLiked, currentIndex);
  };

  return (
    <main className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-pink-50 font-sans overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-xl font-bold tracking-tight">Paws & Prefs</h1>
        </div>
        <div className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentIndex >= 0 ? `${currentIndex + 1} remaining` : "Done"}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">
              Finding purr-fect matches...
            </p>
          </div>
        ) : currentIndex >= 0 ? (
          <div className="flex flex-col items-center w-full max-w-sm h-full max-h-[700px] justify-center">
            <div className="relative w-full aspect-[3/4] mb-8">
              {/*
                custom={exitDirectionRef.current} passes the direction to
                exitVariants.exit() at the exact moment the card unmounts —
                no async lag, always the right direction.
              */}
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
                    >
                      <SwipeCard
                        cat={cat}
                        index={index}
                        currentIndex={currentIndex}
                        isTopCard={isTopCard}
                        onSwipe={(isLiked) => handleSwipe(isLiked, index)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-6 w-full px-4">
              <button
                onClick={() => handleActionClick(false)}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg text-rose-500 hover:scale-110 transition-all active:scale-95"
              >
                <X strokeWidth={3} size={28} />
              </button>
              <button
                onClick={() => handleActionClick(true)}
                className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg text-emerald-500 hover:scale-110 transition-all active:scale-95"
              >
                <Heart strokeWidth={3} fill="currentColor" size={28} />
              </button>
            </div>
          </div>
        ) : (
          <MatchSummary likedCats={likedCats} totalCats={cats.length} />
        )}
      </div>
    </main>
  );
}
