export interface AvsLanguageContent {
  language: string;
  greeting: string;
  summary: string;
  medicines: { name: string; explanation: string }[];
  warningSigns: string[];
  lifestyle: string[];
  followUp: string;
  labs: string[];
  carePlan: string[];
  qrCaption: string;
}

export type AvsKey = "english" | "hindi" | "marathi" | "tamil";

export const lakshmiAvs: Record<AvsKey, AvsLanguageContent> = {
  english: {
    language: "English",
    greeting: "Dear Mrs. Lakshmi Iyer,",
    summary:
      "Your sugar level is a little higher than we want (HbA1c 8.4%). We have added one new medicine and lowered another to keep you safe. Your blood pressure and cholesterol are stable.",
    medicines: [
      { name: "Empagliflozin 10 mg", explanation: "New medicine. One tablet every morning after breakfast. Helps your sugar and protects your heart and kidneys." },
      { name: "Glimepiride 1 mg (reduced)", explanation: "Reduced from 2 mg to 1 mg. Take once daily before breakfast. Lowers risk of low-sugar episodes." },
      { name: "Metformin 1 g · Telmisartan 40 · Atorvastatin 20", explanation: "No change. Continue as before." },
    ],
    warningSigns: [
      "Sweating, shaking, or feeling faint — eat a sweet immediately and check sugar.",
      "Persistent thirst, headache, or chest pressure — call clinic.",
      "Burning or pain when passing urine — call clinic.",
    ],
    lifestyle: [
      "Walk 30 minutes a day. Five days a week minimum.",
      "Avoid fried snacks and sweets. Limit rice to one katori per meal.",
      "Drink 2.5 litres of water daily — important with the new medicine.",
    ],
    followUp: "Visit the clinic again in 12 weeks. Repeat HbA1c will be auto-ordered.",
    labs: ["Fundus photography within 4 weeks at Sankara Eye Hospital.", "Fasting lipid in 6 weeks (home collection by Thyrocare)."],
    carePlan: ["Daily morning sugar check for 2 weeks.", "Log episodes in the One TheraCure app — Dr. Priya can see them."],
    qrCaption: "Scan this QR with the One TheraCure app — your prescription, instructions, and lab orders save instantly.",
  },
  hindi: {
    language: "हिन्दी",
    greeting: "प्रिय श्रीमती लक्ष्मी अय्यर,",
    summary:
      "आपका शुगर थोड़ा अधिक है (HbA1c 8.4%). एक नई दवा जोड़ी गई है और एक पुरानी दवा कम की गई है। ब्लड प्रेशर और कोलेस्ट्रॉल ठीक हैं।",
    medicines: [
      { name: "Empagliflozin 10 mg", explanation: "नई दवा। नाश्ते के बाद रोज़ एक गोली। शुगर कम करती है और दिल/किडनी की रक्षा करती है।" },
      { name: "Glimepiride 1 mg (कम की गई)", explanation: "2 मिग्रा से 1 मिग्रा कर दी गई है। नाश्ते से पहले रोज़ एक गोली।" },
      { name: "Metformin 1 g · Telmisartan 40 · Atorvastatin 20", explanation: "कोई बदलाव नहीं। पहले की तरह जारी रखें।" },
    ],
    warningSigns: [
      "पसीना आना, हाथ कांपना, चक्कर — तुरंत मीठा खाएँ।",
      "लगातार प्यास, सिरदर्द, छाती में दबाव — क्लिनिक को कॉल करें।",
      "पेशाब में जलन — क्लिनिक को कॉल करें।",
    ],
    lifestyle: [
      "रोज़ 30 मिनट टहलें। हफ्ते में कम-से-कम 5 दिन।",
      "तले हुए स्नैक्स और मिठाइयाँ कम करें। एक भोजन में एक कटोरी चावल।",
      "रोज़ 2.5 लीटर पानी पिएँ।",
    ],
    followUp: "12 हफ्ते बाद क्लिनिक आएँ। HbA1c अपने आप ऑर्डर हो जाएगा।",
    labs: ["4 हफ्ते में फंडस फोटो — शंकरा आई हॉस्पिटल।", "6 हफ्ते में लिपिड टेस्ट — Thyrocare घर आकर लेगा।"],
    carePlan: ["रोज़ सुबह शुगर चेक करें — 2 हफ्ते तक।", "सब कुछ One TheraCure ऐप में नोट करें।"],
    qrCaption: "इस QR को One TheraCure ऐप से स्कैन करें — सब कुछ अपने आप सेव हो जाएगा।",
  },
  marathi: {
    language: "मराठी",
    greeting: "प्रिय श्रीमती लक्ष्मी अय्यर,",
    summary:
      "तुमच्या साखरेची पातळी थोडी जास्त आहे (HbA1c 8.4%). एक नवीन औषध दिले आहे आणि एक पूर्वीचे कमी केले आहे.",
    medicines: [
      { name: "Empagliflozin 10 mg", explanation: "नवीन औषध. नाश्त्यानंतर रोज एक गोळी." },
      { name: "Glimepiride 1 mg", explanation: "2 मिग्रा वरून 1 मिग्रा. नाश्त्यापूर्वी." },
      { name: "Metformin · Telmisartan · Atorvastatin", explanation: "बदल नाही." },
    ],
    warningSigns: ["घाम, थरथरणे, अशक्तपणा — लगेच गोड खा.", "सतत तहान, डोकेदुखी — दवाखान्यात कॉल करा."],
    lifestyle: ["दररोज 30 मिनिटे चालणे.", "तळलेले पदार्थ टाळा.", "2.5 लिटर पाणी प्या."],
    followUp: "12 आठवड्यांनंतर भेटा.",
    labs: ["4 आठवड्यांत फंडस तपासणी.", "6 आठवड्यांत लिपिड चाचणी."],
    carePlan: ["रोज सकाळी साखर तपासा — 2 आठवडे.", "ॲपवर नोंद ठेवा."],
    qrCaption: "हा QR One TheraCure ॲपवर स्कॅन करा.",
  },
  tamil: {
    language: "தமிழ்",
    greeting: "அன்புள்ள திருமதி லக்ஷ்மி ஐயர்,",
    summary: "உங்கள் சர்க்கரை அளவு கொஞ்சம் கூடுதலாக உள்ளது (HbA1c 8.4%). ஒரு புதிய மருந்து சேர்க்கப்பட்டுள்ளது.",
    medicines: [
      { name: "Empagliflozin 10 mg", explanation: "புதிய மருந்து. காலை உணவுக்கு பிறகு தினமும் ஒரு மாத்திரை." },
      { name: "Glimepiride 1 mg", explanation: "2 mg-இல் இருந்து 1 mg-ஆக குறைக்கப்பட்டது." },
      { name: "மற்ற மருந்துகள்", explanation: "மாற்றம் இல்லை." },
    ],
    warningSigns: ["வியர்வை, நடுக்கம் — உடனே இனிப்பு சாப்பிடுங்கள்.", "தலைவலி, மார்பு அழுத்தம் — மருத்துவமனைக்கு அழைக்கவும்."],
    lifestyle: ["தினமும் 30 நிமிட நடைப்பயிற்சி.", "வறுத்த உணவை குறைக்கவும்.", "தினமும் 2.5 லிட்டர் தண்ணீர்."],
    followUp: "12 வாரங்களில் மீண்டும் வாருங்கள்.",
    labs: ["4 வாரங்களில் கண் பரிசோதனை.", "6 வாரங்களில் lipid சோதனை."],
    carePlan: ["தினமும் காலை சர்க்கரை அளவை சரிபார்க்கவும்.", "செயலியில் பதிவு செய்யவும்."],
    qrCaption: "One TheraCure செயலியில் இந்த QR-ஐ ஸ்கேன் செய்யவும்.",
  },
};
