import fs from 'fs';
import { DATA } from './client/src/utils/constants.js';
import { translations } from './client/src/utils/translations.js';

// Define Tamil mappings for all DATA constants
const tamilMap = {
  // Marital Status
  'Never Married': 'திருமணமாகாதவர்',
  'Divorced': 'விவாகரத்து பெற்றவர்',
  'Widow': 'விதவை',
  'Widower': 'மனைவியை இழந்தவர்',
  'Awaiting Divorce': 'விவாகரத்திற்காக காத்திருப்பவர்',

  // Mother Tongue
  'Tamil': 'தமிழ்',
  'Telugu': 'தெலுங்கு',
  'Malayalam': 'மலையாளம்',
  'Kannada': 'கன்னடம்',
  'Hindi': 'ஹிந்தி',
  'English': 'ஆங்கிலம்',
  'Urdu': 'உருது',
  'Marathi': 'மராத்தி',
  'Bengali': 'பெங்காலி',
  'Gujarati': 'குஜராத்தி',
  'Punjabi': 'பஞ்சாபி',
  'Odia': 'ஒடியா',
  'Assamese': 'அஸ்ஸாமி',
  'Others': 'மற்றவை',

  // Physical Status
  'Normal': 'சாதாரணமானவர்',
  'Physically Challenged': 'உடல் ஊனமுற்றோர்',
  'Hearing Impaired': 'கேட்கும் திறன் குறைபாடு',
  'Speech Impaired': 'பேசும் திறன் குறைபாடு',
  'Visually Challenged': 'பார்வை குறைபாடு',
  'Differently Abled': 'மாற்றுத்திறனாளி',

  // Colors
  'Very Fair': 'மிகவும் சிகப்பு',
  'Fair': 'சிகப்பு',
  'Wheatish': 'கோதுமை நிறம்',
  'Medium': 'நடுத்தர நிறம்',
  'Dark': 'கருப்பு',

  // Religions
  'Hindu': 'இந்து',
  'Muslim': 'முஸ்லிம்',
  'Christian': 'கிறிஸ்தவர்',
  'Sikh': 'சீக்கியர்',
  'Jain': 'சமணர்',
  'Buddhist': 'பௌத்தர்',
  'Zoroastrian': 'பார்சி',
  'Jewish': 'யூதர்',
  'No Bar': 'தடையில்லை',

  // Hindu Castes
  'Brahmin': 'பிராமணர்',
  'Mudaliyar': 'முதலியார்',
  'Vanniyar': 'வன்னியர்',
  'Thevar': 'தேவர்',
  'Nadar': 'நாடார்',
  'Chettiar': 'செட்டியார்',
  'Gounder': 'கவுண்டர்',
  'Naidu': 'நாயுடு',
  'Pillai': 'பிள்ளை',
  'Yadava': 'யாதவர்',
  'SC': 'பட்டியலினத்தவர் (SC)',
  'ST': 'பழங்குடியினர் (ST)',

  // Muslim Castes
  'Sunni': 'சுன்னி',
  'Shia': 'ஷியா',
  'Rowther': 'ராவுத்தர்',
  'Labbai': 'லெப்பை',
  'Maraikayar': 'மரைக்காயர்',

  // Christian Castes
  'Roman Catholic': 'ரோமன் கத்தோலிக்கர்',
  'CSI': 'சி.எஸ்.ஐ (CSI)',
  'Pentecostal': 'பெந்தேகோஸ்தே',
  'Protestant': 'ப்ராட்டஸ்டன்ட்',

  // Education
  'No Education': 'படிக்கவில்லை',
  'SSLC': '10ஆம் வகுப்பு',
  'HSC': '12ஆம் வகுப்பு',
  'Diploma': 'டிப்ளமோ',
  'B.E': 'பி.இ (B.E)',
  'B.Tech': 'பி.டெக் (B.Tech)',
  'B.Sc': 'பி.எஸ்சி (B.Sc)',
  'B.Com': 'பி.காம் (B.Com)',
  'BBA': 'பி.பி.ஏ (BBA)',
  'BCA': 'பி.சி.ஏ (BCA)',
  'BA': 'பி.ஏ (BA)',
  'MBBS': 'எம்.பி.பி.எஸ் (MBBS)',
  'BDS': 'பி.டி.எஸ் (BDS)',
  'B.Pharm': 'பி.பார்ம் (B.Pharm)',
  'LLB': 'எல்.எல்.பி (LLB)',
  'M.E': 'எம்.இ (M.E)',
  'M.Tech': 'எம்.டெக் (M.Tech)',
  'M.Sc': 'எம்.எஸ்சி (M.Sc)',
  'M.Com': 'எம்.காம் (M.Com)',
  'MBA': 'எம்.பி.ஏ (MBA)',
  'MCA': 'எம்.சி.ஏ (MCA)',
  'MA': 'எம்.ஏ (MA)',
  'M.Pharm': 'எம்.பார்ம் (M.Pharm)',
  'MD': 'எம்.டி (MD)',
  'MS': 'எம்.எஸ் (MS)',
  'M.Phil': 'எம்.பில் (M.Phil)',
  'PhD': 'முனைவர் (PhD)',
  'Doctorate': 'டாக்டரேட்',

  // Rasis
  'Mesham': 'மேஷம்',
  'Rishabam': 'ரிஷபம்',
  'Mithunam': 'மிதுனம்',
  'Kadagam': 'கடகம்',
  'Simmam': 'சிம்மம்',
  'Kanni': 'கன்னி',
  'Thulam': 'துலாம்',
  'Viruchigam': 'விருச்சிகம்',
  'Dhanusu': 'தனுசு',
  'Magaram': 'மகரம்',
  'Kumbam': 'கும்பம்',
  'Meenam': 'மீனம்',

  // Countries
  'India': 'இந்தியா',
  'USA': 'அமெரிக்கா',
  'UK': 'இங்கிலாந்து',
  'Canada': 'கனடா',
  'Australia': 'ஆஸ்திரேலியா',
  'Singapore': 'சிங்கப்பூர்',
  'UAE': 'ஐக்கிய அரபு அமீரகம்',
  'Germany': 'ஜெர்மனி',
  'France': 'பிரான்ஸ்',
  'Italy': 'இத்தாலி',
  'Japan': 'ஜப்பான்',
  'New Zealand': 'நியூசிலாந்து',
  
  // Family Types
  'Joint': 'கூட்டுக் குடும்பம்',
  'Nuclear': 'தனிக்குடும்பம்'
};

const statesTamilMap = {
  'Tamil Nadu': 'தமிழ்நாடு',
  'Andhra Pradesh': 'ஆந்திரப் பிரதேசம்',
  'Kerala': 'கேரளா',
  'Karnataka': 'கர்நாடகா',
  'Maharashtra': 'மகாராஷ்டிரா',
  'Delhi': 'டெல்லி'
};

// Add all constants to English and Tamil dictionaries
const extractAllStrings = () => {
  const strings = new Set();
  
  DATA.maritalStatus.forEach(s => strings.add(s));
  DATA.motherTongue.forEach(s => strings.add(s));
  DATA.physicalStatus.forEach(s => strings.add(s));
  DATA.colors.forEach(s => strings.add(s));
  DATA.religions.forEach(s => strings.add(s));
  DATA.education.forEach(s => strings.add(s));
  
  // Castes
  Object.values(DATA.castes).forEach(arr => arr.forEach(s => strings.add(s)));
  
  // Rasi
  Object.keys(DATA.rasiData).forEach(s => strings.add(s));
  
  // Countries & States
  DATA.locations.forEach(s => strings.add(s));
  Object.values(DATA.statesByCountry).forEach(arr => arr.forEach(s => strings.add(s)));
  
  // Add family types manually
  strings.add('Joint');
  strings.add('Nuclear');

  return Array.from(strings);
};

const allStrings = extractAllStrings();

allStrings.forEach(str => {
  if (!translations.en[str]) translations.en[str] = str;
  if (!translations.ta[str]) {
    translations.ta[str] = tamilMap[str] || statesTamilMap[str] || str;
  }
});

const output = 'export const translations = ' + JSON.stringify(translations, null, 2) + ';';
fs.writeFileSync('./client/src/utils/translations.js', output);
console.log('Translations updated!');
