export const extractFirstImage = (content) => {
  if (typeof window === "undefined" || !content) return null;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const firstImage = doc.querySelector("img");

    if (firstImage && firstImage.src) {
      return firstImage.src;
    }
  } catch (error) {
    console.error("Error extracting image:", error);
  }

  return null;
};

export const getOptimizedImageUrl = (url, width = 300) => {
  if (!url) return "/placeholder-image.jpg";

  try {
    new URL(url);
  } catch (e) {
    return "/placeholder-image.jpg";
  }

  if (url.startsWith("data:")) {
    return url;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!url.startsWith("/") && !url.includes(supabaseUrl)) {
    return url;
  }

  return url;
};
