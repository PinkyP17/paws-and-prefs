// src/components/MatchSummary.tsx
import { motion } from "framer-motion";
import { Heart, RefreshCcw, Share2, Sparkles } from "lucide-react";

export default function MatchSummary({
  likedCats,
  totalCats,
}: {
  likedCats: { id: string; imageUrl: string }[];
  totalCats: number;
}) {
  const percentage = Math.round((likedCats.length / totalCats) * 100);

  return (
    <div className="w-full max-w-2xl flex flex-col items-center py-8 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 z-10 relative">
      {/* Decorative background for summary */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square bg-indigo-50/50 rounded-full blur-3xl -z-10" />

      <div className="relative mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3"
        >
          <Heart size={48} fill="currentColor" />
        </motion.div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-4 -right-4 text-indigo-400"
        >
          <Sparkles size={32} />
        </motion.div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tight">
          {likedCats.length > 0 ? "It's a Match!" : "No Matches?"}
        </h2>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-600 font-bold text-sm">
          <span>{likedCats.length} Liked</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>{percentage}% Affinity</span>
        </div>
      </div>

      {likedCats.length > 0 ? (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {likedCats.map((cat, index) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                damping: 15
              }}
              key={cat.id || `liked-${index}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md border-2 border-white hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <img
                src={cat.imageUrl}
                alt="Liked cat"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-white text-[10px] font-bold uppercase tracking-wider">Saved to Favorites</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 text-center max-w-sm shadow-xl shadow-slate-200/50 mb-12">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <RefreshCcw size={32} />
          </div>
          <p className="text-slate-600 font-bold text-lg mb-2">
            Quite picky, aren't we?
          </p>
          <p className="text-slate-400 text-sm">
            Maybe the next batch will have the purr-fect companion for you.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <RefreshCcw size={20} strokeWidth={3} /> Start Over
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-lg border border-slate-100 hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Share2 size={20} strokeWidth={3} /> Share Results
        </button>
      </div>
    </div>
  );
}
