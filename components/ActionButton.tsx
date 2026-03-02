import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";

export default function ActionButton({
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
            className={`absolute inset-0 rounded-full ${
              isLike ? "bg-indigo-400" : "bg-rose-400"
            }`}
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
