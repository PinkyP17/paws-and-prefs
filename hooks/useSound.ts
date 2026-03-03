// src/hooks/useSound.ts

type SoundType = "like" | "pass" | "swipe" | "undo";

export function useSound() {
  const play = (type: SoundType) => {
    try {
      // HTML5 Audio handles playback scheduling natively and reliably
      const audio = new Audio(`/sounds/${type}.mp3`);

      // Keep it subtle
      audio.volume = 0.4;

      // Play returns a promise. We catch it to prevent console red text
      // if the browser strictly blocks the very first sound before interaction.
      audio.play().catch((err) => {
        console.warn(`Audio blocked or missing for ${type}:`, err);
      });
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  };

  return { play };
}
