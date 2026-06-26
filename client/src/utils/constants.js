export const heroImage =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=85";

export const plans = [
  {
    name: "Free",
    price: "0",
    features: ["Create profile", "Search matches", "Send limited interests"]
  },
  {
    name: "Premium",
    price: "1,499",
    features: ["Unlimited chat", "View contact details", "Profile boost"]
  }
];

export const testimonials = [
  {
    name: "Meera & Arjun",
    text: "The profile details felt genuine, and the conversations started with real compatibility."
  },
  {
    name: "Nisha & Karthik",
    text: "The match filters helped our families focus on people who shared the same values."
  },
  {
    name: "Priya & Rohan",
    text: "Atamio made a big decision feel calm, organized, and personal."
  }
];

export const profileSections = {
  basic: ["name", "age", "dob", "gender", "height", "weight", "marital", "language", "physical", "color"],
  religion: ["religion", "caste", "subCaste", "gothram"],
  location: ["country", "state", "city", "nativePlace", "currentPlace"],
  education: ["degree", "college"],
  career: ["jobTitle", "company", "salary"],
  family: ["fatherOccupation", "motherOccupation", "siblings", "familytype"],
  lifestyle: ["smoking", "drinking", "foodType"],
  horoscope: ["rasi", "nakshatra", "dosham"],
  about: ["about"],
  preferences: ["ageMin", "ageMax", "height", "religion", "caste", "education", "salary", "location"]
};

export const DATA = {
  rasiData: {
    "Mesham":    ["Aswini", "Bharani", "Karthigai (1st Pada)"],
    "Rishabam":  ["Karthigai (2,3,4 Pada)", "Rohini", "Mirugasirisham (1,2 Pada)"],
    "Mithunam":  ["Mirugasirisham (3,4 Pada)", "Thiruvathirai", "Punarpoosam (1,2,3 Pada)"],
    "Kadagam":   ["Punarpoosam (4th Pada)", "Poosam", "Ayilyam"],
    "Simmam":    ["Magam", "Pooram", "Uthiram (1st Pada)"],
    "Kanni":     ["Uthiram (2,3,4 Pada)", "Hastham", "Chithirai (1,2 Pada)"],
    "Thulam":    ["Chithirai (3,4 Pada)", "Swathi", "Visakam (1,2,3 Pada)"],
    "Viruchigam":["Visakam (4th Pada)", "Anusham", "Kettai"],
    "Dhanusu":   ["Moolam", "Pooradam", "Uthiradam (1st Pada)"],
    "Magaram":   ["Uthiradam (2,3,4 Pada)", "Thironam", "Avittam (1,2 Pada)"],
    "Kumbam":    ["Avittam (3,4 Pada)", "Sadayam", "Poorattadhi (1,2,3 Pada)"],
    "Meenam":    ["Poorattadhi (4th Pada)", "Uthirattadhi", "Revathi"]
  },
  doshamTypes: ["No Dosham","Sevvai Dosham","Naga Dosham","Kalathra Dosham","Rahu Dosham","Kethu Dosham","Pitru Dosham","Guru Chandal Dosham","Shani Dosham","Sarpa Dosham"],
  maritalStatus: ["Never Married","Divorced","Widow","Widower","Awaiting Divorce"],
  motherTongue: ["Tamil","Telugu","Malayalam","Kannada","Hindi","English","Urdu","Marathi","Bengali","Gujarati","Punjabi","Odia","Assamese","Others"],
  physicalStatus: ["Normal","Physically Challenged","Hearing Impaired","Speech Impaired","Visually Challenged","Differently Abled"],
  colors: ["Very Fair", "Fair", "Wheatish", "Medium", "Dark"],
  religions: ["Hindu","Muslim","Christian","Sikh","Jain","Buddhist","Zoroastrian","Jewish","Others","No Bar"],
  education: ["SSLC","HSC","Diploma","B.E","B.Tech","B.Sc","B.Com","BBA","BCA","BA","MBBS","BDS","B.Pharm","LLB","M.E","M.Tech","M.Sc","M.Com","MBA","MCA","MA","M.Pharm","MD","MS","M.Phil","PhD","Doctorate"],
  professions: ["Software Engineer","Developer","Tester","Data Analyst","Data Scientist","AI Engineer","DevOps Engineer","Government Employee","Teacher","Professor","Doctor","Dentist","Nurse","Pharmacist","Business Owner","Entrepreneur","Startup Founder","Trader","Civil Engineer","Mechanical Engineer","Electrical Engineer","CA","Accountant","Auditor","Banker","Lawyer","Architect","Police","Army","Farmer","Driver","Self Employed","Private Employee","Not Working"],
  locations: ["India","USA","UK","Canada","Australia","Singapore","UAE","Germany","France","Italy","Japan","New Zealand","Others"],
  statesByCountry: {
    "India": ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry","Chandigarh","Others"],
    "USA": ["Alabama","Alaska","Arizona","California","Colorado","Florida","Georgia","Illinois","Michigan","New Jersey","New York","Ohio","Pennsylvania","Texas","Virginia","Washington","Others"],
    "UK": ["England","Scotland","Wales","Northern Ireland","Others"],
    "Canada": ["Alberta","British Columbia","Manitoba","Ontario","Quebec","Saskatchewan","Others"],
    "Australia": ["New South Wales","Queensland","South Australia","Tasmania","Victoria","Western Australia","Others"],
    "Singapore": ["Central","East","North","North-East","West","Others"],
    "UAE": ["Abu Dhabi","Dubai","Sharjah","Ajman","Fujairah","Ras Al Khaimah","Umm Al Quwain"],
    "Germany": ["Bavaria","Berlin","Hamburg","Hesse","Lower Saxony","North Rhine-Westphalia","Others"],
    "Others": ["Other"]
  },
  castes: {
    "Hindu":     ["Brahmin","Mudaliyar","Vanniyar","Thevar","Nadar","Chettiar","Gounder","Naidu","Pillai","Yadava","SC","ST","Others"],
    "Muslim":    ["Sunni","Shia","Rowther","Labbai","Maraikayar","Others"],
    "Christian": ["Roman Catholic","CSI","Pentecostal","Protestant","Others"],
    "Sikh":      ["Jatt","Khatri","Arora","Others"],
    "Jain":      ["Digambar","Shvetambara","Others"]
  }
};
