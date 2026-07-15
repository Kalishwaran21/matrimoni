export const formatName = (user, lang) => {
  if (!user) return "Anonymous";
  
  // If the passed argument is a string (fallback legacy usage), return it
  if (typeof user === "string") return user;
  
  if (lang === "ta") {
    // If user has an explicitly provided Tamil name, return it.
    // Otherwise fallback to English name
    return user.fullNameTamil || user.fullName || "பெயரற்றவர்";
  }
  
  return user.fullName || "Anonymous";
};
