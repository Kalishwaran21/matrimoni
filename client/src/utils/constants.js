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
    text: "Soulmate made a big decision feel calm, organized, and personal."
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
  education: ["No Education","Primary School","Middle School","SSLC (10th)","HSC (12th)","ITI","Diploma","B.E","B.Tech","B.Sc","B.Com","BBA","BCA","BA","B.Arch","MBBS","BDS","B.Pharm","B.Nursing","LLB","M.E","M.Tech","M.Sc","M.Com","MBA","MCA","MA","M.Pharm","MD","MS","M.Phil","PhD","Doctorate","Other"],
  jobCategories: [
    "IT / Software",
    "Government Job",
    "Private Company",
    "Business / Self Employed",
    "Healthcare / Medical",
    "Education / Teaching",
    "Engineering (Non-IT)",
    "Banking / Finance",
    "Law / Legal",
    "Agriculture / Farming",
    "Armed Forces / Police",
    "Arts / Media / Design",
    "Not Working",
    "Other"
  ],
  jobsByCategory: {
    "IT / Software": ["Software Engineer","Frontend Developer","Backend Developer","Full Stack Developer","Mobile Developer (Android)","Mobile Developer (iOS)","DevOps Engineer","Cloud Engineer (AWS/Azure/GCP)","Data Analyst","Data Scientist","ML / AI Engineer","QA / Test Engineer","Cybersecurity Analyst","Database Administrator","UI/UX Designer","IT Support / Help Desk","ERP Consultant","Network Engineer","System Administrator","Product Manager (IT)","Scrum Master","Technical Lead","Software Architect","CTO / VP Engineering","Other IT Role"],
    "Government Job": ["IAS / IPS / IFS Officer","State Government Officer","Tahsildar / Revenue Officer","Police Officer / Constable","Government Doctor","Government Teacher","Government Engineer","Bank Officer (Govt Bank)","Railway Employee","Postal Employee","Defense / Army / Navy / Air Force","Court / Legal (Govt)","Municipal / Panchayat Employee","Government Nurse","Other Government Role"],
    "Private Company": ["Private Company Employee","Sales Executive","Marketing Executive","HR Executive","Finance / Accounts Executive","Operations Manager","Logistics / Supply Chain","Customer Support","Retail / Shop Employee","Factory / Production Worker","Driver / Transport","Security / Guard","Other Private Role"],
    "Business / Self Employed": ["Business Owner","Shop Owner / Trader","Entrepreneur / Startup Founder","Real Estate","Import / Export","Contractor","Freelancer","Commission Agent","Other Business"],
    "Healthcare / Medical": ["Doctor (MBBS)","Specialist Doctor","Dentist","Nurse","Pharmacist","Physiotherapist","Lab Technician","Radiologist","Ayurvedic / Siddha / Homeo Doctor","Hospital Administrator","Other Healthcare"],
    "Education / Teaching": ["School Teacher","College Lecturer","Professor","Tuition Teacher","Trainer / Coach","Principal / HM","Other Teaching Role"],
    "Engineering (Non-IT)": ["Civil Engineer","Mechanical Engineer","Electrical Engineer","Electronics Engineer","Chemical Engineer","Automobile Engineer","Site Engineer","Quality Engineer","Safety Engineer","Other Engineering"],
    "Banking / Finance": ["Bank Manager","Bank Clerk / PO","CA / Chartered Accountant","Financial Advisor","Insurance Agent","Stock Broker","Auditor","Tax Consultant","Other Finance"],
    "Law / Legal": ["Advocate / Lawyer","Judge","Legal Consultant","Court Employee","Other Legal"],
    "Agriculture / Farming": ["Farmer","Agriculture Officer","Horticulturist","Dairy Farmer","Poultry / Animal Husbandry","Other Agriculture"],
    "Armed Forces / Police": ["Army","Navy","Air Force","Police Officer","Paramilitary","Other Defense"],
    "Arts / Media / Design": ["Actor / Actress","Singer / Musician","Photographer","Graphic Designer","Video Editor","Journalist","Content Creator","Other Arts / Media"],
    "Not Working": ["Student","Housewife / Homemaker","Looking for Job","Retired","Not Working"],
    "Other": ["Other"]
  },
  professions: ["IT / Software","Government Job","Private Company","Business / Self Employed","Healthcare / Medical","Education / Teaching","Engineering (Non-IT)","Banking / Finance","Law / Legal","Agriculture / Farming","Armed Forces / Police","Arts / Media / Design","Not Working","Other"],
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
  },
  tamilNaduDistricts: [
    "Ariyalur",
    "Chengalpattu",
    "Chennai",
    "Coimbatore",
    "Cuddalore",
    "Dharmapuri",
    "Dindigul",
    "Erode",
    "Kallakurichi",
    "Kanchipuram",
    "Kanyakumari",
    "Karur",
    "Krishnagiri",
    "Madurai",
    "Mayiladuthurai",
    "Nagapattinam",
    "Namakkal",
    "Nilgiris",
    "Perambalur",
    "Pudukkottai",
    "Ramanathapuram",
    "Ranipet",
    "Salem",
    "Sivaganga",
    "Tenkasi",
    "Thanjavur",
    "Theni",
    "Thoothukudi",
    "Tiruchirappalli",
    "Tirunelveli",
    "Tirupathur",
    "Tiruppur",
    "Tiruvallur",
    "Tiruvannamalai",
    "Tiruvarur",
    "Vellore",
    "Viluppuram",
    "Virudhunagar"
  ],
  districtsByState: {
    "Andhra Pradesh": [
      "Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool", 
      "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", 
      "Annamayya", "Anakapalli", "Bapatla", "Eluru", "Kakinada", "Konaseema", "Nandyal", 
      "Palnadu", "Parvathipuram Manyam", "Sri Sathya Sai", "Tirupati", "NTR", 
      "Sri Potti Sriramulu Nellore"
    ],
    "Arunachal Pradesh": [
      "Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", 
      "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", 
      "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", 
      "Changlang", "Tirap", "Longding", "Kamle", "Shi Yomi", "Lepa Rada"
    ],
    "Assam": [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", 
      "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", 
      "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", 
      "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", 
      "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", 
      "West Karbi Anglong", "Bajali", "Tamulpur"
    ],
    "Bihar": [
      "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", 
      "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", 
      "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", 
      "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", 
      "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", 
      "Siwan", "Supaul", "Vaishali", "West Champaran"
    ],
    "Chhattisgarh": [
      "Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", 
      "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", 
      "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", 
      "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja", 
      "Gaurela-Pendra-Marwahi", "Manendragarh-Chirmiri-Bharatpur", 
      "Mohla-Manpur-Ambagarh Chowki", "Sakti", "Sarangarh-Bilaigarh", 
      "Khairagarh-Chhuikhadan-Gandai"
    ],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", 
      "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhumi Dwarka", "Gandhinagar", 
      "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", 
      "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", 
      "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
    ],
    "Haryana": [
      "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", 
      "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", 
      "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
    ],
    "Himachal Pradesh": [
      "Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", 
      "Mandi", "Shimla", "Sirmaur", "Solan", "Una"
    ],
    "Jharkhand": [
      "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", 
      "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", 
      "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", 
      "Seraikela Kharsawan", "Simdega", "West Singhbhum"
    ],
    "Karnataka": [
      "Bengaluru Urban", "Bengaluru Rural", "Bagalkot", "Ballari", "Belagavi", "Bidar", 
      "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", 
      "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", 
      "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", 
      "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir", "Vijayanagara"
    ],
    "Kerala": [
      "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", 
      "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", 
      "Thrissur", "Wayanad"
    ],
    "Madhya Pradesh": [
      "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", 
      "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", 
      "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Narmadapuram", "Indore", 
      "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", 
      "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", 
      "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", 
      "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
    ],
    "Maharashtra": [
      "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", 
      "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", 
      "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", 
      "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", 
      "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", 
      "Washim", "Yavatmal"
    ],
    "Manipur": [
      "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Senapati", 
      "Tamenglong", "Thoubal", "Ukhrul", "Kangpokpi", "Tengnoupal", "Pherzawl", "Noney", 
      "Kamjong", "Jiribam", "Kakching"
    ],
    "Meghalaya": [
      "East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", 
      "Ribhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", 
      "West Garo Hills", "West Jaintia Hills", "West Khasi Hills", "Eastern West Khasi Hills"
    ],
    "Mizoram": [
      "Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", 
      "Serchhip", "Hnahthial", "Khawzawl", "Saitual"
    ],
    "Nagaland": [
      "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", 
      "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto", "Chümoukedima", "Tseminyü", 
      "Niuland", "Shamator"
    ],
    "Odisha": [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", 
      "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", 
      "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", 
      "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", 
      "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    ],
    "Punjab": [
      "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
      "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", 
      "Malerkotla", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", 
      "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Tarn Taran"
    ],
    "Rajasthan": [
      "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", 
      "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", 
      "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", 
      "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", 
      "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
    ],
    "Sikkim": ["Gangtok", "Mangan", "Namchi", "Gyalshing", "Soreng", "Pakyong"],
    "Tamil Nadu": [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
      "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", 
      "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", 
      "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", 
      "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
      "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", 
      "Viluppuram", "Virudhunagar"
    ],
    "Telangana": [
      "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", 
      "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", 
      "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", 
      "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", 
      "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", 
      "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Hanamkonda", 
      "Yadadri Bhuvanagiri"
    ],
    "Tripura": [
      "Dhalai", "North Tripura", "South Tripura", "West Tripura", "Unakoti", "Khowai", 
      "Sipahijala", "Gomati"
    ],
    "Uttar Pradesh": [
      "Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", 
      "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", 
      "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", 
      "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", 
      "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", 
      "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", 
      "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", 
      "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", 
      "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", 
      "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", 
      "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", 
      "Unnao", "Varanasi"
    ],
    "Uttarakhand": [
      "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", 
      "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", 
      "Uttarkashi"
    ],
    "West Bengal": [
      "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", 
      "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", 
      "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur", "Paschim Bardhaman", 
      "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ],
    "Delhi": [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", 
      "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", 
      "West Delhi"
    ],
    "Jammu & Kashmir": [
      "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", 
      "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Ramban", "Reasi", 
      "Samba", "Shopian", "Srinagar", "Udhampur"
    ],
    "Ladakh": ["Leh", "Kargil"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Chandigarh": ["Chandigarh"],
    "Others": ["Other"]
  }
};
