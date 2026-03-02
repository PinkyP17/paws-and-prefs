"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Undo2 } from "lucide-react";

import { useCats, type Cat } from "@/hooks/useCats";
import { preloadImageBlob } from "@/utils/imageUtils";

import MatchSummary from "@/components/MatchSummary";
import SwipeCard from "@/components/SwipeCard";
import ActionButton from "@/components/ActionButton";

const exitVariants = {
  exit: (direction: number) => ({
    x: direction,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  }),
};

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
  const [isPreparingSummary, setIsPreparingSummary] = useState(false);
  const [history, setHistory] = useState<SwipeRecord[]>([]);

  const isSwipingRef = useRef(false);
  const hasInitialized = useRef(false);
  const exitDirectionRef = useRef(0);
  const exitingIndexRef = useRef<number | null>(null);

  const preloadPromisesRef = useRef<Map<string, Promise<void>>>(new Map());
  const blobUrlsRef = useRef<Map<string, string>>(new Map());

  if (cats.length > 0 && !hasInitialized.current) {
    hasInitialized.current = true;
    setCurrentIndex(cats.length - 1);
  }

  useEffect(() => {
    if (
      !isLoading &&
      cats.length > 0 &&
      currentIndex === -1 &&
      !showSummary &&
      !isPreparingSummary
    ) {
      setIsPreparingSummary(true);

      const pending = Array.from(preloadPromisesRef.current.values());
      Promise.all(pending).then(() => {
        setTimeout(() => {
          setIsPreparingSummary(false);
          setShowSummary(true);
        }, 1500);
      });
    }
  }, [currentIndex, isLoading, cats.length, showSummary, isPreparingSummary]);

  const handleSwipe = (isLiked: boolean, index: number) => {
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;

    exitDirectionRef.current = isLiked ? 600 : -600;
    exitingIndexRef.current = index;

    const cat = cats[index];
    setHistory((prev) => [...prev, { cat, index, isLiked }]);

    if (isLiked) {
      setLikedCats((prev) => [...prev, cat]);
      if (!preloadPromisesRef.current.has(cat.imageUrl)) {
        const promise = preloadImageBlob(cat.imageUrl).then((blobUrl) => {
          blobUrlsRef.current.set(cat.imageUrl, blobUrl);
        });
        preloadPromisesRef.current.set(cat.imageUrl, promise);
      }
    }

    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => {
      isSwipingRef.current = false;
      exitingIndexRef.current = null;
    }, 350);
  };

  const handleUndo = () => {
    if (isSwipingRef.current || history.length === 0) return;
    isSwipingRef.current = true;

    const last = history[history.length - 1];

    if (last.isLiked) {
      setLikedCats((prev) => prev.filter((c) => c.id !== last.cat.id));
      preloadPromisesRef.current.delete(last.cat.imageUrl);
      const blobUrl = blobUrlsRef.current.get(last.cat.imageUrl);
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
      blobUrlsRef.current.delete(last.cat.imageUrl);
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

  const summaryCats = likedCats.map((cat) => ({
    ...cat,
    imageUrl: blobUrlsRef.current.get(cat.imageUrl) || cat.imageUrl,
  }));

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
            {!showSummary && !isPreparingSummary ? (
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
                      const isExiting = exitingIndexRef.current === index;

                      return (
                        <motion.div
                          key={cat.id}
                          className="absolute w-full h-full"
                          style={{ zIndex: isExiting ? 999 : index }}
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
            ) : isPreparingSummary ? (
              <motion.div
                key="preparing"
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-100 border-t-pink-500 rounded-full animate-spin" />
                  <Heart
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500 animate-pulse"
                    size={32}
                    fill="currentColor"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight mb-1">
                    Analyzing Purrsonalities...
                  </h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">
                    Finding your matches
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                className="w-full h-full flex justify-center"
                initial={{ opacity: 0, y: 48, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <MatchSummary likedCats={summaryCats} totalCats={cats.length} />
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
