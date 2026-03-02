// src/hooks/useCats.ts
import { useState, useEffect } from "react";

export type Cat = {
  id: string;
  imageUrl: string;
  tag: string;
  emoji: string;
};

// Curated tag→emoji map for personality feel
const TAG_EMOJI_MAP: Record<string, string> = {
  cute: "🥰",
  funny: "😂",
  grumpy: "😾",
  lazy: "😴",
  fluffy: "☁️",
  orange: "🍊",
  black: "🖤",
  white: "🤍",
  kitten: "🍼",
  angry: "😤",
  sad: "😢",
  wild: "🐆",
  sleepy: "💤",
  cute2: "✨",
  fat: "🍔",
  small: "🔬",
  big: "🏔️",
  pretty: "💅",
  silly: "🃏",
  adorable: "💖",
};

const FALLBACK_TAGS = Object.keys(TAG_EMOJI_MAP);

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

const EAGER_COUNT = 3;

export function useCats(limit = 10) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCats = async () => {
      try {
        // Fetch cats and available tags in parallel
        const [catsRes, tagsRes] = await Promise.all([
          fetch(`https://cataas.com/api/cats?limit=${limit}`, {
            headers: { Accept: "application/json" },
          }),
          fetch("https://cataas.com/api/tags", {
            headers: { Accept: "application/json" },
          }),
        ]);

        const catsData = await catsRes.json();
        const tagsData: string[] = tagsRes.ok
          ? await tagsRes.json()
          : FALLBACK_TAGS;

        // Build a pool of tags we have emojis for, falling back to full list
        const knownTags = tagsData.filter(
          (t) => TAG_EMOJI_MAP[t.toLowerCase()],
        );
        const tagPool = knownTags.length > 0 ? knownTags : FALLBACK_TAGS;

        const formattedCats: Cat[] = catsData.map((cat: any) => {
          // Prefer the cat's own tags if they match our emoji map
          const catTags: string[] = (cat.tags || []).filter(
            (t: string) => TAG_EMOJI_MAP[t.toLowerCase()],
          );
          const chosenTag =
            catTags.length > 0
              ? catTags[Math.floor(Math.random() * catTags.length)]
              : tagPool[Math.floor(Math.random() * tagPool.length)];

          const tag = chosenTag.charAt(0).toUpperCase() + chosenTag.slice(1);
          const emoji = TAG_EMOJI_MAP[chosenTag.toLowerCase()] ?? "🐱";

          return {
            id: cat.id || cat._id,
            imageUrl: `https://cataas.com/cat/${cat.id || cat._id}`,
            tag,
            emoji,
          };
        });

        // Eager-load first visible cards, lazy-load the rest in background
        const eager = formattedCats.slice(-EAGER_COUNT);
        const lazy = formattedCats.slice(0, -EAGER_COUNT);

        await Promise.all(eager.map((c) => preloadImage(c.imageUrl)));
        setCats(formattedCats);
        setIsLoading(false);

        lazy.reverse().forEach((c) => preloadImage(c.imageUrl));
      } catch (err) {
        console.error("Error fetching cats:", err);
        setIsLoading(false);
      }
    };

    loadCats();
  }, [limit]);

  return { cats, isLoading };
}
