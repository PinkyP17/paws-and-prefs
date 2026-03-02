// src/components/MatchSummary.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  RefreshCcw,
  Share2,
  Check,
  Download,
  X,
  MousePointerClick,
} from "lucide-react";
import type { Cat } from "@/hooks/useCats";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

// ─── Individual Cat Tile ──────────────────────────────────────────────────────
function CatTile({ cat, onClick }: { cat: Cat; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      layoutId={`cat-expand-${cat.id}`}
      variants={itemVariants}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative h-full w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer bg-slate-100 group"
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse z-0">
          <Heart className="text-slate-300" size={24} />
        </div>
      )}

      <img
        src={cat.imageUrl}
        alt={cat.tag}
        loading="eager"
        onLoad={() => setLoaded(true)}
        className={`relative z-10 w-full h-full object-cover transition-all duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black/60 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-20">
        <span>{cat.emoji}</span>
        <span className="truncate max-w-[40px] md:max-w-none">{cat.tag}</span>
      </div>
    </motion.div>
  );
}

// ─── Hidden Share Grid (For Image Export) ─────────────────────────────────────
function ShareGrid({
  cats,
  affinity,
  totalCats,
}: {
  cats: Cat[];
  affinity: number;
  totalCats: number;
}) {
  // Dynamically adjust columns for the export image as well
  const cols = cats.length > 6 ? 4 : 3;

  return (
    <div
      style={{
        background: "#f8fafc",
        padding: 24,
        borderRadius: 24,
        fontFamily: "sans-serif",
        width: 600,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#1e293b" }}>
          Paws & Prefs
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#94a3b8",
            marginTop: 4,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {cats.length} Liked · {affinity}% Affinity · out of {totalCats} cats
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
        }}
      >
        {cats.map((cat) => (
          <div
            key={cat.id}
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            <img
              src={cat.imageUrl}
              alt={cat.tag}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              crossOrigin="anonymous"
            />
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                background: "rgba(0,0,0,0.65)",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              {cat.tag}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Summary Component ───────────────────────────────────────────────────
export default function MatchSummary({
  likedCats,
  totalCats,
}: {
  likedCats: Cat[];
  totalCats: number;
}) {
  const shareGridRef = useRef<HTMLDivElement>(null);
  const [shareState, setShareState] = useState<"idle" | "loading" | "done">(
    "idle",
  );
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null); // NEW: State for expanded cat

  const domToImageRef = useRef<any>(null);
  const affinity = Math.round((likedCats.length / totalCats) * 100);

  // Dynamic columns: switch to 4 columns if there are 7 or more cats to keep it on one screen
  const gridCols = likedCats.length > 6 ? "grid-cols-4" : "grid-cols-3";

  useEffect(() => {
    import("dom-to-image-more").then((mod) => {
      domToImageRef.current = mod.default;
    });
  }, []);

  const handleShare = async () => {
    if (shareState === "loading" || !shareGridRef.current) return;
    setShareState("loading");

    try {
      const domToImage =
        domToImageRef.current ?? (await import("dom-to-image-more")).default;
      const blob = await domToImage.toBlob(shareGridRef.current, {
        quality: 1,
        scale: 2,
        bgcolor: "#f8fafc",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paws-and-prefs.png";
      a.click();
      URL.revokeObjectURL(url);

      try {
        const file = new File([blob], "paws-and-prefs.png", {
          type: "image/png",
        });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: "My Paws & Prefs Results",
            text: `I liked ${likedCats.length} out of ${totalCats} cats — ${affinity}% affinity! 🐱`,
            files: [file],
          });
        }
      } catch {
        /* Native share dismissed */
      }

      setShareState("done");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Share failed:", err);
      setShareState("idle");
    }
  };

  // Custom function to download the specific expanded cat image
  const handleSaveExpandedCat = () => {
    if (!selectedCat) return;
    const a = document.createElement("a");
    a.href = selectedCat.imageUrl;
    a.download = `my-favorite-kitty-${selectedCat.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="w-full max-w-2xl flex flex-col items-center z-10 relative px-4 h-full max-h-[100dvh]">
        {/* Header */}
        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-2 mt-4 text-indigo-500 shrink-0">
          <Heart size={28} fill="currentColor" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-1 shrink-0">
          It's a Match!
        </h2>
        <p className="text-slate-400 mb-2 text-[10px] md:text-xs font-bold tracking-widest uppercase shrink-0">
          {likedCats.length} Liked &bull; {affinity}% Affinity
        </p>

        {/* NEW: UX Hint Badge */}
        {likedCats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-500 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 shrink-0"
          >
            <MousePointerClick size={14} className="animate-pulse" />
            Tap a kitty to enlarge
          </motion.div>
        )}

        {/* Flexible Grid */}
        {likedCats.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={`grid ${gridCols} gap-2 w-full flex-1 min-h-0 pb-2`}
            style={{ gridAutoRows: "1fr" }}
          >
            {likedCats.map((cat) => (
              <CatTile
                key={cat.id}
                cat={cat}
                onClick={() => setSelectedCat(cat)}
              />
            ))}
          </motion.div>
        ) : (
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200 text-center max-w-sm mx-auto flex-1 flex flex-col justify-center min-h-0">
            <p className="text-slate-600 font-medium">
              No matches this time! You must have very specific taste.
            </p>
          </div>
        )}

        {/* Hidden export grid */}
        <div
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            pointerEvents: "none",
          }}
        >
          <div ref={shareGridRef}>
            <ShareGrid
              cats={likedCats}
              affinity={affinity}
              totalCats={totalCats}
            />
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-auto flex gap-3 flex-wrap justify-center w-full pb-6 pt-2 shrink-0">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all flex-1 max-w-[200px] text-sm md:text-base"
          >
            <RefreshCcw size={18} /> Start Over
          </button>

          {likedCats.length > 0 && (
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex-1 max-w-[200px] text-sm md:text-base"
            >
              {shareState === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Preparing...
                </>
              ) : shareState === "done" ? (
                <>
                  <Check size={18} /> Downloaded!
                </>
              ) : (
                <>
                  <Share2 size={18} /> Share Results
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* ─── NEW: Expanded Cat Overlay (Hero Animation) ────────────────────── */}
      <AnimatePresence>
        {selectedCat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedCat(null)}
          >
            <motion.div
              layoutId={`cat-expand-${selectedCat.id}`}
              className="relative w-full max-w-xs md:max-w-sm aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent tap from closing the modal
            >
              <img
                src={selectedCat.imageUrl}
                alt={selectedCat.tag}
                className="w-full h-full object-cover"
              />

              {/* Close Button */}
              <button
                onClick={() => setSelectedCat(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/60 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Info & Save Button */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-4 pt-16">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-sm shadow-inner">
                  <span>{selectedCat.emoji}</span>
                  <span>{selectedCat.tag}</span>
                </div>

                <button
                  onClick={handleSaveExpandedCat}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-900 rounded-xl font-bold shadow-xl hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <Download size={18} /> Save Image
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
