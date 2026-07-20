import fs from 'fs';
import { DATA } from './client/src/utils/constants.js';
import { translations } from './client/src/utils/translations.js';

const statesTamilMap = {
  // India
  "Andhra Pradesh": "ஆந்திரப் பிரதேசம்",
  "Arunachal Pradesh": "அருணாச்சலப் பிரதேசம்",
  "Assam": "அசாம்",
  "Bihar": "பீகார்",
  "Chhattisgarh": "சத்தீஸ்கர்",
  "Goa": "கோவா",
  "Gujarat": "குஜராத்",
  "Haryana": "ஹரியானா",
  "Himachal Pradesh": "இமாச்சலப் பிரதேசம்",
  "Jharkhand": "ஜார்க்கண்ட்",
  "Karnataka": "கர்நாடகா",
  "Kerala": "கேரளா",
  "Madhya Pradesh": "மத்தியப் பிரதேசம்",
  "Maharashtra": "மகாராஷ்டிரா",
  "Manipur": "மணிப்பூர்",
  "Meghalaya": "மேகாலயா",
  "Mizoram": "மிசோரம்",
  "Nagaland": "நாகாலாந்து",
  "Odisha": "ஒடிசா",
  "Punjab": "பஞ்சாப்",
  "Rajasthan": "ராஜஸ்தான்",
  "Sikkim": "சிக்கிம்",
  "Tamil Nadu": "தமிழ்நாடு",
  "Telangana": "தெலுங்கானா",
  "Tripura": "திரிபுரா",
  "Uttar Pradesh": "உத்தரப் பிரதேசம்",
  "Uttarakhand": "உத்தரகாண்ட்",
  "West Bengal": "மேற்கு வங்கம்",
  "Delhi": "டெல்லி",
  "Jammu & Kashmir": "ஜம்மு மற்றும் காஷ்மீர்",
  "Ladakh": "லடாக்",
  "Puducherry": "புதுச்சேரி",
  "Chandigarh": "சண்டிகர்",
  
  // USA
  "Alabama": "அலபாமா",
  "Alaska": "அலாஸ்கா",
  "Arizona": "அரிசோனா",
  "California": "கலிபோர்னியா",
  "Colorado": "கொலராடோ",
  "Florida": "புளோரிடா",
  "Georgia": "ஜார்ஜியா",
  "Illinois": "இலினாய்ஸ்",
  "Michigan": "மிச்சிகன்",
  "New Jersey": "நியூ ஜெர்சி",
  "New York": "நியூயார்க்",
  "Ohio": "ஒகையோ",
  "Pennsylvania": "பென்சில்வேனியா",
  "Texas": "டெக்சாஸ்",
  "Virginia": "வர்ஜீனியா",
  "Washington": "வாஷிங்டன்",

  // UK
  "England": "இங்கிலாந்து",
  "Scotland": "ஸ்காட்லாந்து",
  "Wales": "வேல்ஸ்",
  "Northern Ireland": "வட அயர்லாந்து",

  // Canada
  "Alberta": "ஆல்பெர்ட்டா",
  "British Columbia": "பிரிட்டிஷ் கொலம்பியா",
  "Manitoba": "மனிடோபா",
  "Ontario": "ஒன்டாரியோ",
  "Quebec": "கியூபெக்",
  "Saskatchewan": "சஸ்காட்செவன்",

  // Australia
  "New South Wales": "நியூ சவுத் வேல்ஸ்",
  "Queensland": "குயின்ஸ்லாந்து",
  "South Australia": "தெற்கு ஆஸ்திரேலியா",
  "Tasmania": "டாஸ்மேனியா",
  "Victoria": "விக்டோரியா",
  "Western Australia": "மேற்கு ஆஸ்திரேலியா",

  // Singapore
  "Central": "மத்திய பகுதி",
  "East": "கிழக்கு",
  "North": "வடக்கு",
  "North-East": "வட-கிழக்கு",
  "West": "மேற்கு",

  // UAE
  "Abu Dhabi": "அபுதாபி",
  "Dubai": "துபாய்",
  "Sharjah": "ஷார்ஜா",
  "Ajman": "அஜ்மான்",
  "Fujairah": "புஜைரா",
  "Ras Al Khaimah": "ராஸ் அல் கைமா",
  "Umm Al Quwain": "உம் அல் குவைன்",

  // Germany
  "Bavaria": "பவேரியா",
  "Berlin": "பெர்லின்",
  "Hamburg": "ஹாம்பர்க்",
  "Hesse": "ஹெஸ்ஸி",
  "Lower Saxony": "கீழ் சாக்சனி",
  "North Rhine-Westphalia": "வட ரைன்-வெஸ்ட்பாலியா",

  "Others": "மற்றவை",
  "Other": "மற்றவை"
};

// Add state translations to existing dict
Object.keys(statesTamilMap).forEach(state => {
  translations.ta[state] = statesTamilMap[state];
});

const output = 'export const translations = ' + JSON.stringify(translations, null, 2) + ';';
fs.writeFileSync('./client/src/utils/translations.js', output);
console.log('States translated successfully!');
