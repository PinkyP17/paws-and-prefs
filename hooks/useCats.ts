// src/hooks/useCats.ts
import { useState, useEffect } from "react";

export function useCats(limit = 10) {
  const [cats, setCats] = useState<{ id: string; imageUrl: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCats = async () => {
      try {
        const response = await fetch(
          `https://cataas.com/api/cats?limit=${limit}`,
        );
        const data = await response.json();

        const formattedCats = data.map((cat: any) => ({
          id: cat.id || cat._id,
          imageUrl: `https://cataas.com/cat/${cat.id || cat._id}`,
        }));

        setCats(formattedCats);
      } catch (error) {
        console.error("Error fetching cats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCats();
  }, [limit]);

  return { cats, isLoading };
}
