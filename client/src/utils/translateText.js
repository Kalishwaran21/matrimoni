export const translateToTamil = async (text) => {
  if (!text || !text.trim()) return "";
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=en|ta`
    );
    const data = await res.json();
    if (data.responseData?.translatedText) {
      const doc = new DOMParser().parseFromString(data.responseData.translatedText, "text/html");
      return doc.body.textContent || data.responseData.translatedText;
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
  return "";
};
