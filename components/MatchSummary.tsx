// src/components/MatchSummary.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, RefreshCcw, Share2, Check } from "lucide-react";
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

function CatTile({ cat }: { cat: Cat }) {
  const imgRef = useRef<HTMLImageElement>(null);
  // If the image is already in browser cache, img.complete is true immediately
  // — no need to wait for onLoad, so we skip the shimmer entirely.
  const [loaded, setLoaded] = useState(() => {
    if (typeof window === "undefined") return false;
    const img = new window.Image();
    img.src = cat.imageUrl;
    return img.complete;
  });

  return (
    <motion.div
      variants={itemVariants}
      className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-100"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-200 to-slate-100" />
      )}
      <img
        ref={imgRef}
        src={cat.imageUrl}
        alt={cat.tag}
        loading="eager"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-200 group-hover:scale-110 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
        <span>{cat.emoji}</span>
        <span>{cat.tag}</span>
      </div>
    </motion.div>
  );
}

function ShareGrid({
  cats,
  affinity,
  totalCats,
}: {
  cats: Cat[];
  affinity: number;
  totalCats: number;
}) {
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
          gridTemplateColumns: "repeat(3, 1fr)",
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
  // Hold the module reference so it's loaded before the user clicks
  const domToImageRef = useRef<any>(null);
  const affinity = Math.round((likedCats.length / totalCats) * 100);

  // Pre-load the library on mount (client-only, after hydration)
  useEffect(() => {
    import("dom-to-image-more").then((mod) => {
      domToImageRef.current = mod.default;
    });
  }, []);

  const handleShare = async () => {
    if (shareState === "loading" || !shareGridRef.current) return;
    setShareState("loading");

    try {
      // Use pre-loaded ref, or load on demand as fallback
      const domToImage =
        domToImageRef.current ?? (await import("dom-to-image-more")).default;

      const blob = await domToImage.toBlob(shareGridRef.current, {
        quality: 1,
        scale: 2,
        bgcolor: "#f8fafc",
      });

      // Always download first
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "paws-and-prefs.png";
      a.click();
      URL.revokeObjectURL(url);

      // Also try native share on mobile as a bonus
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
        // Native share dismissed or unsupported — download already done
      }

      setShareState("done");
      setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      console.error("Share failed:", err);
      setShareState("idle");
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center z-10 relative px-4">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-500">
        <Heart size={40} fill="currentColor" />
      </div>
      <h2 className="text-4xl font-extrabold text-slate-800 mb-2">
        It's a Match!
      </h2>
      <p className="text-slate-400 mb-8 text-sm font-bold tracking-widest uppercase">
        {likedCats.length} Liked &bull; {affinity}% Affinity
      </p>

      {/* Visible UI grid */}
      {likedCats.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full"
        >
          {likedCats.map((cat) => (
            <CatTile key={cat.id} cat={cat} />
          ))}
        </motion.div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200 text-center max-w-sm mx-auto">
          <p className="text-slate-600 font-medium">
            No matches this time! You must have very specific taste.
          </p>
        </div>
      )}

      {/* Hidden export grid rendered off-screen for dom-to-image capture */}
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

      <div className="mt-10 flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
        >
          <RefreshCcw size={18} /> Start Over
        </button>

        {likedCats.length > 0 && (
          <motion.button
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
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
  );
}
