export async function preloadImageBlob(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to preload blob:", error);
    return url; // Fallback to normal URL if the fetch fails
  }
}
