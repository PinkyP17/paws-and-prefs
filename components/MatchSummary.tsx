// src/components/MatchSummary.tsx
import { motion } from "framer-motion";
import { Heart, RefreshCcw } from "lucide-react";

export default function MatchSummary({
  likedCats,
  totalCats,
}: {
  likedCats: { id: string; imageUrl: string }[];
  totalCats: number;
}) {
  return (
    <div className="w-full max-w-2xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 z-10 relative">
      <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-500">
        <Heart size={48} fill="currentColor" />
      </div>
      <h2 className="text-4xl font-extrabold text-slate-800 mb-2">
        It's a Match!
      </h2>
      <p className="text-slate-500 mb-10 text-lg">
        You swiped right on {likedCats.length} out of {totalCats} cats.
      </p>

      {likedCats.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg px-4">
          {likedCats.map((cat, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={cat.id || `liked-${index}`}
              className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 group"
            >
              <img
                src={cat.imageUrl}
                alt="Liked cat"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-slate-200 text-center max-w-sm">
          <p className="text-slate-600 font-medium">
            No matches this time! You must have very specific taste.
          </p>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-12 flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"
      >
        <RefreshCcw size={20} /> Start Over
      </button>
    </div>
  );
}
