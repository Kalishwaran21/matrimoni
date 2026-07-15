import { transliterate } from "indic-transliterator";

export const formatName = (name, lang) => {
  if (!name || typeof name !== "string") return name;
  if (lang !== "ta") return name;
  
  // If the name already has Tamil characters, leave it as is
  if (/[\u0B80-\u0BFF]/.test(name)) return name;

  // Split into words, transliterate each word, and capitalize properly
  const words = name.toLowerCase().split(/\s+/);
  const transliterated = words.map(w => transliterate(w, "tamil")).join(" ");
  
  return transliterated;
};
