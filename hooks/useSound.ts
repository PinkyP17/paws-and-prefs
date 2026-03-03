// src/hooks/useSound.ts

type SoundType = "like" | "pass" | "swipe" | "undo";

export function useSound() {
  const play = (type: SoundType) => {
    try {
      const basePath =
        process.env.NODE_ENV === "production" ? "/paws-and-prefs" : "";
      const audio = new Audio(`${basePath}/${type}.mp3`);

      // Keep it subtle
      audio.volume = 0.4;

      audio.play().catch((err) => {
        console.warn(`Audio blocked or missing for ${type}:`, err);
      });
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  };

  return { play };
}
