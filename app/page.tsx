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
  const likeScale = useTransform(x, [0, 80], [0.5, 1]);
  const nopeScale = useTransform(x, [0, -80], [0.5, 1]);

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
      <img
        src={cat.imageUrl}
        alt="Cat candidate"
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pt-32 pb-10 px-8 pointer-events-none">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mb-1">Candidate</p>
            <h2 className="text-white text-4xl font-black tracking-tight">Kitty #{index + 1}</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
            <Sparkles size={20} fill="currentColor" />
          </div>
        </div>
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

  const progress = cats.length > 0 ? ((cats.length - 1 - currentIndex) / cats.length) * 100 : 0;

  return (
    <main className="relative flex flex-col min-h-[100dvh] bg-slate-50 font-sans overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-200/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 blur-[120px] rounded-full pointer-events-none" />
      
      <header className="flex flex-col gap-4 px-6 pt-6 pb-2 z-10 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Paws & Prefs</h1>
          </div>
          <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            {currentIndex >= 0 ? `${currentIndex + 1} TO GO` : "FINISHED"}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
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
              <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={24} fill="currentColor" />
            </div>
            <p className="text-slate-500 font-bold tracking-wide uppercase text-sm">
              Fetching kitty magic...
            </p>
          </div>
        ) : currentIndex >= 0 ? (
          <div className="flex flex-col items-center w-full max-w-[400px] h-full justify-center gap-8">
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

            <div className="flex items-center justify-center gap-8 w-full">
              <button
                onClick={() => handleActionClick(false)}
                className="group relative w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-xl text-rose-500 hover:bg-rose-50 transition-all active:scale-90 border border-slate-100"
              >
                <X strokeWidth={3} size={28} />
                <span className="absolute -bottom-6 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Pass</span>
              </button>
              
              <button
                onClick={() => handleActionClick(true)}
                className="group relative w-20 h-20 flex items-center justify-center bg-indigo-600 rounded-full shadow-2xl shadow-indigo-200 text-white hover:bg-indigo-700 transition-all active:scale-90"
              >
                <Heart strokeWidth={2.5} fill="currentColor" size={32} />
                <span className="absolute -bottom-6 text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Like</span>
              </button>
            </div>
          </div>
        ) : (
          <MatchSummary likedCats={likedCats} totalCats={cats.length} />
        )}
      </div>
      
      {/* Footer Branding */}
      <footer className="py-6 flex justify-center opacity-30 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Paws & Preferences v1.0</p>
      </footer>
    </main>
  );
}
