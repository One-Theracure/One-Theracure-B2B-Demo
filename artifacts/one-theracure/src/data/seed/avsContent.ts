/**
 * Seed: Localized After-Visit Summary (AVS) bundles.
 *
 * For demo patients whose consults have been staged with a specific clinical
 * narrative, we ship a hand-translated AVS in English / Hindi / Marathi / Tamil
 * so the Prescription/AVS panel can render the full multilingual experience
 * instead of the English-only auto-generated fallback.
 *
 * Tone: warm, plain-language, action-oriented (an investor or a real patient
 * should read it and immediately know what to do).
 *
 * Shape mirrors `DigitalAVSData` from `services/documentOutputService.ts` so
 * the existing AVSView in `DocumentOutputDrawer` can render either source
 * with no extra mapping.
 */

import type { DigitalAVSData } from "@/services/documentOutputService";

export type AvsLocale = "en" | "hi" | "mr" | "ta";

export const AVS_LOCALES: { code: AvsLocale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
];

/**
 * Static parts of an AVS bundle that don't change across languages.
 * The renderer merges these with a per-locale text payload to produce
 * a full `DigitalAVSData` at runtime.
 */
interface AvsBundleStatic {
  patientId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  /** ISO date string (YYYY-MM-DD) — relative dates are computed at render time. */
  daysUntilFollowUp: number;
}

interface AvsLocalizedText {
  patientName: string;
  doctorName: string;
  clinicName: string;
  whatWeFound: string[];
  whatToDo: string[];
  medications: { name: string; dose: string; howToTake: string }[];
  testsAdvised: string[];
  followUpInstructions: string;
  warningSignsGoER: string[];
  warningSignsCallClinic: string[];
  careRoutine: string[];
}

export interface LocalizedAvsBundle {
  patientId: string;
  static: AvsBundleStatic;
  text: Record<AvsLocale, AvsLocalizedText>;
}

/* ─── P002 · Mr. Raj Kumar · Diabetes review (HbA1c) ───────────────────── */

const rajKumarAvs: LocalizedAvsBundle = {
  patientId: "P002",
  static: {
    patientId: "P002",
    patientName: "Mr. Raj Kumar",
    doctorName: "Dr. Priya Sharma",
    clinicName: "TheraCure Health Clinic",
    daysUntilFollowUp: 21,
  },
  text: {
    en: {
      patientName: "Mr. Raj Kumar",
      doctorName: "Dr. Priya Sharma",
      clinicName: "TheraCure Health Clinic",
      whatWeFound: [
        "Your HbA1c is 8.2% — slightly above the target of 7%.",
        "Your fasting sugar averaged 165 mg/dL over the last week.",
        "Kidney function and blood pressure are stable.",
      ],
      whatToDo: [
        "Take Metformin 500 mg twice a day with meals — do not skip doses.",
        "Add Glimepiride 1 mg before breakfast starting tomorrow.",
        "Walk briskly for 30 minutes a day, 5 days a week.",
        "Avoid sweets, fruit juice, and white rice for the next 3 weeks.",
      ],
      medications: [
        { name: "Metformin 500 mg", dose: "Twice daily", howToTake: "With breakfast and dinner — never on an empty stomach." },
        { name: "Glimepiride 1 mg", dose: "Once daily", howToTake: "15 minutes before breakfast. Eat within 30 minutes of taking it." },
      ],
      testsAdvised: ["Fasting Blood Sugar (after 2 weeks)", "HbA1c (after 3 months)", "Urine Microalbumin"],
      followUpInstructions: "Bring your home sugar log and the lab reports. Try to come fasting (no breakfast).",
      warningSignsGoER: [
        "Sugar reading below 60 mg/dL with sweating, shaking, or confusion.",
        "Severe chest pain or breathlessness.",
        "Fainting, seizure, or sudden vision loss.",
      ],
      warningSignsCallClinic: [
        "Three or more sugar readings above 250 mg/dL in one week.",
        "Frequent urination at night, unusual thirst, or rapid weight loss.",
        "Cuts on the feet that are slow to heal.",
      ],
      careRoutine: [
        "Check fasting sugar every morning before breakfast.",
        "Eat at the same times every day — do not skip meals.",
        "Inspect your feet every night for cuts, blisters, or redness.",
        "Drink 8 glasses of water; reduce tea/coffee with sugar.",
      ],
    },
    hi: {
      patientName: "श्री राज कुमार",
      doctorName: "डॉ. प्रिया शर्मा",
      clinicName: "थेराक्योर हेल्थ क्लिनिक",
      whatWeFound: [
        "आपका HbA1c 8.2% है — लक्ष्य 7% से थोड़ा अधिक है।",
        "पिछले हफ्ते आपकी सुबह की शुगर औसतन 165 mg/dL रही।",
        "किडनी और रक्तचाप स्थिर हैं।",
      ],
      whatToDo: [
        "मेटफॉर्मिन 500 mg दिन में दो बार खाने के साथ लें — कोई खुराक न छोड़ें।",
        "कल से नाश्ते से पहले ग्लिमेपिराइड 1 mg शुरू करें।",
        "हफ्ते में 5 दिन, रोज़ 30 मिनट तेज़ चलें।",
        "अगले 3 हफ्तों तक मिठाई, फलों का रस और सफ़ेद चावल बंद रखें।",
      ],
      medications: [
        { name: "मेटफॉर्मिन 500 mg", dose: "दिन में दो बार", howToTake: "नाश्ते और रात के खाने के साथ — खाली पेट कभी न लें।" },
        { name: "ग्लिमेपिराइड 1 mg", dose: "दिन में एक बार", howToTake: "नाश्ते से 15 मिनट पहले लें। 30 मिनट के अंदर खाना ज़रूर खाएँ।" },
      ],
      testsAdvised: ["फास्टिंग शुगर (2 हफ्ते बाद)", "HbA1c (3 महीने बाद)", "यूरिन माइक्रोएल्बुमिन"],
      followUpInstructions: "अपनी शुगर डायरी और रिपोर्ट्स लेकर आइए। कोशिश कीजिए कि खाली पेट (बिना नाश्ते) आएं।",
      warningSignsGoER: [
        "शुगर 60 mg/dL से कम और साथ में पसीना, कंपकंपी या उलझन।",
        "तेज़ छाती में दर्द या साँस लेने में दिक्कत।",
        "बेहोशी, दौरा, या अचानक नज़र चली जाना।",
      ],
      warningSignsCallClinic: [
        "एक हफ्ते में तीन या ज़्यादा बार शुगर 250 mg/dL के ऊपर।",
        "रात में बार-बार पेशाब, बहुत प्यास, या तेज़ी से वज़न घटना।",
        "पैर पर कोई घाव जो जल्दी न भरे।",
      ],
      careRoutine: [
        "रोज़ सुबह नाश्ते से पहले शुगर जाँचें।",
        "हर दिन एक ही समय पर खाना खाएँ — कोई वक़्त न छोड़ें।",
        "हर रात पैरों को देखें — कोई कट, छाले या लाली तो नहीं।",
        "8 गिलास पानी पिएँ; मीठी चाय/कॉफ़ी कम करें।",
      ],
    },
    mr: {
      patientName: "श्री. राज कुमार",
      doctorName: "डॉ. प्रिया शर्मा",
      clinicName: "थेराक्युअर हेल्थ क्लिनिक",
      whatWeFound: [
        "तुमचा HbA1c 8.2% आहे — लक्ष्य 7% पेक्षा थोडासा जास्त.",
        "मागच्या आठवड्यात उपवासातील साखर सरासरी 165 mg/dL होती.",
        "किडनी आणि रक्तदाब स्थिर आहेत.",
      ],
      whatToDo: [
        "मेटफॉर्मिन 500 mg दिवसातून दोनदा जेवणाबरोबर घ्या — कुठलीही मात्रा सोडू नका.",
        "उद्यापासून न्याहारीपूर्वी ग्लिमेपिराइड 1 mg सुरू करा.",
        "आठवड्यातून 5 दिवस रोज 30 मिनिटे जलद चालत जा.",
        "पुढच्या 3 आठवड्यांसाठी गोड पदार्थ, फळांचा रस आणि पांढरा भात टाळा.",
      ],
      medications: [
        { name: "मेटफॉर्मिन 500 mg", dose: "दिवसातून दोनदा", howToTake: "न्याहारी आणि रात्रीच्या जेवणासोबत — कधीच रिकाम्या पोटी नाही." },
        { name: "ग्लिमेपिराइड 1 mg", dose: "दिवसातून एकदा", howToTake: "न्याहारीच्या 15 मिनिटे आधी. नंतर 30 मिनिटांत जेवण घ्या." },
      ],
      testsAdvised: ["फास्टिंग शुगर (2 आठवड्यांनंतर)", "HbA1c (3 महिन्यांनंतर)", "लघवीचे मायक्रोअल्ब्युमिन"],
      followUpInstructions: "तुमची साखरेची नोंदवही आणि रिपोर्ट्स घेऊन या. शक्य असल्यास उपाशीच (न्याहारीशिवाय) या.",
      warningSignsGoER: [
        "साखर 60 mg/dL पेक्षा कमी, सोबत घाम, थरथर किंवा गोंधळ.",
        "तीव्र छातीत दुखणे किंवा श्वास घेण्यास त्रास.",
        "बेशुद्धी, फिट येणे, किंवा अचानक नजर जाणे.",
      ],
      warningSignsCallClinic: [
        "एका आठवड्यात तीन किंवा जास्त वेळा साखर 250 mg/dL पेक्षा जास्त.",
        "रात्री वारंवार लघवी, खूप तहान किंवा झपाट्याने वजन कमी होणे.",
        "पायावर लवकर न भरणारी जखम.",
      ],
      careRoutine: [
        "रोज सकाळी न्याहारीपूर्वी साखर तपासा.",
        "रोज एकाच वेळी जेवण घ्या — वेळा बदलू नका.",
        "रोज रात्री पाय तपासा — कोणतीही जखम, फोड किंवा लालसरपणा.",
        "8 ग्लास पाणी प्या; गोड चहा/कॉफी कमी करा.",
      ],
    },
    ta: {
      patientName: "திரு. ராஜ் குமார்",
      doctorName: "டாக்டர். பிரியா ஷர்மா",
      clinicName: "தெராக்யூர் ஹெல்த் கிளினிக்",
      whatWeFound: [
        "உங்கள் HbA1c 8.2% — இலக்கான 7%-ஐ விட சற்று அதிகம்.",
        "கடந்த வாரம் காலை சர்க்கரை சராசரியாக 165 mg/dL இருந்தது.",
        "சிறுநீரகம் மற்றும் இரத்த அழுத்தம் நிலையாக உள்ளன.",
      ],
      whatToDo: [
        "மெட்ஃபார்மின் 500 mg-ஐ உணவுடன் தினமும் இருமுறை எடுத்துக் கொள்ளுங்கள் — மருந்தைத் தவிர்க்க வேண்டாம்.",
        "நாளை முதல் காலை உணவுக்கு முன் கிளிமிபிரைடு 1 mg-ஐத் தொடங்குங்கள்.",
        "வாரத்தில் 5 நாட்கள், தினமும் 30 நிமிடம் வேகமாக நடவுங்கள்.",
        "அடுத்த 3 வாரங்களுக்கு இனிப்புகள், பழச்சாறு மற்றும் வெள்ளை அரிசியைத் தவிர்க்கவும்.",
      ],
      medications: [
        { name: "மெட்ஃபார்மின் 500 mg", dose: "தினமும் இருமுறை", howToTake: "காலை மற்றும் இரவு உணவுடன் — வெறும் வயிற்றில் ஒருபோதும் இல்லை." },
        { name: "கிளிமிபிரைடு 1 mg", dose: "தினமும் ஒருமுறை", howToTake: "காலை உணவுக்கு 15 நிமிடம் முன். 30 நிமிடத்திற்குள் உணவு உண்ணவும்." },
      ],
      testsAdvised: ["காலை சர்க்கரை சோதனை (2 வாரங்களுக்குப் பிறகு)", "HbA1c (3 மாதங்களுக்குப் பிறகு)", "சிறுநீர் மைக்ரோஅல்புமின்"],
      followUpInstructions: "உங்கள் வீட்டு சர்க்கரை குறிப்பேடு மற்றும் பரிசோதனை அறிக்கைகளைக் கொண்டு வாருங்கள். முடிந்தால் காலை உணவு இல்லாமல் வாருங்கள்.",
      warningSignsGoER: [
        "சர்க்கரை 60 mg/dL-க்கு கீழே, வியர்வை, நடுக்கம் அல்லது குழப்பத்துடன்.",
        "கடுமையான மார்பு வலி அல்லது மூச்சுத்திணறல்.",
        "மயக்கம், வலிப்பு அல்லது திடீர் பார்வை இழப்பு.",
      ],
      warningSignsCallClinic: [
        "ஒரு வாரத்தில் மூன்று அல்லது அதற்கு மேற்பட்ட சர்க்கரை அளவு 250 mg/dL-க்கு மேல்.",
        "இரவில் அடிக்கடி சிறுநீர் கழித்தல், அதிக தாகம் அல்லது வேகமாக எடை குறைதல்.",
        "காலில் ஆறாத காயம்.",
      ],
      careRoutine: [
        "தினமும் காலை உணவுக்கு முன் சர்க்கரையை சோதிக்கவும்.",
        "தினமும் ஒரே நேரத்தில் உணவு உண்ணவும் — உணவைத் தவிர்க்க வேண்டாம்.",
        "ஒவ்வொரு இரவும் கால்களைச் சோதிக்கவும் — வெட்டு, கொப்புளம் அல்லது சிவப்பு உள்ளதா என.",
        "8 கப் தண்ணீர் குடிக்கவும்; சர்க்கரையுடன் கூடிய தேநீர்/காபியைக் குறைக்கவும்.",
      ],
    },
  },
};

/* ─── P003 · Ms. Anita Singh · Oncology surveillance follow-up ─────────── */

const anitaSinghAvs: LocalizedAvsBundle = {
  patientId: "P003",
  static: {
    patientId: "P003",
    patientName: "Ms. Anita Singh",
    doctorName: "Dr. Priya Sharma",
    clinicName: "TheraCure Health Clinic",
    daysUntilFollowUp: 90,
  },
  text: {
    en: {
      patientName: "Ms. Anita Singh",
      doctorName: "Dr. Priya Sharma",
      clinicName: "TheraCure Health Clinic",
      whatWeFound: [
        "Your annual breast cancer surveillance check is reassuring — no new lumps and your scar is healing well.",
        "Tamoxifen is being well tolerated. No new side effects reported.",
        "Bone density and liver tests from last month are within the normal range.",
      ],
      whatToDo: [
        "Continue Tamoxifen 20 mg every morning — do not stop on your own, even if you feel completely well.",
        "Take Calcium + Vitamin D3 once a day, preferably after lunch.",
        "Do a simple breast self-exam at home once a month, a week after your period (or on the same date if you are post-menopausal).",
        "Return in 3 months for the next surveillance visit.",
      ],
      medications: [
        { name: "Tamoxifen 20 mg", dose: "Once daily", howToTake: "Same time every morning, with or without food. Continue for the full 5 years." },
        { name: "Calcium 500 mg + Vitamin D3 250 IU", dose: "Once daily", howToTake: "After lunch. Helps protect your bones while on Tamoxifen." },
      ],
      testsAdvised: ["Mammogram (annual)", "Pelvic ultrasound (annual)", "Liver function test (every 6 months)"],
      followUpInstructions: "Bring your medication strip and any home temperature/symptom log. The visit will take about 30 minutes.",
      warningSignsGoER: [
        "Sudden shortness of breath, severe chest pain, or coughing up blood.",
        "Sudden swelling and pain in one calf or thigh (possible blood clot).",
        "Severe abdominal pain with vomiting that won't stop.",
      ],
      warningSignsCallClinic: [
        "Any new lump in the breast, underarm, or neck — even a small one.",
        "Unusual vaginal bleeding or discharge between periods.",
        "Persistent fatigue, jaundice, or unexplained weight loss.",
        "Hot flashes that disrupt sleep for more than 2 weeks.",
      ],
      careRoutine: [
        "Eat plenty of vegetables, fruit, and whole grains; limit red meat.",
        "Walk or do light yoga for 30 minutes most days.",
        "Avoid alcohol and stop smoking completely.",
        "Keep a calendar of your monthly self-exam — pick a date you'll remember.",
      ],
    },
    hi: {
      patientName: "सुश्री अनीता सिंह",
      doctorName: "डॉ. प्रिया शर्मा",
      clinicName: "थेराक्योर हेल्थ क्लिनिक",
      whatWeFound: [
        "आपकी सालाना ब्रेस्ट कैंसर निगरानी जांच आश्वस्त करने वाली है — कोई नई गांठ नहीं और घाव अच्छी तरह भर रहा है।",
        "टैमोक्सिफेन ठीक से सहन हो रहा है। कोई नया साइड इफेक्ट नहीं।",
        "पिछले महीने की हड्डी और जिगर की जांच सामान्य सीमा में हैं।",
      ],
      whatToDo: [
        "टैमोक्सिफेन 20 mg हर सुबह लेना जारी रखें — खुद से बंद न करें, भले ही पूरी तरह ठीक महसूस हो।",
        "कैल्शियम + विटामिन D3 दिन में एक बार, अधिमानतः दोपहर के खाने के बाद लें।",
        "महीने में एक बार घर पर स्तन की जांच करें — माहवारी के एक हफ्ते बाद (या उसी तारीख को अगर मासिक धर्म बंद हो चुका है)।",
        "अगली निगरानी विज़िट के लिए 3 महीने बाद आइए।",
      ],
      medications: [
        { name: "टैमोक्सिफेन 20 mg", dose: "दिन में एक बार", howToTake: "रोज़ एक ही समय पर, खाने के साथ या बिना। पूरे 5 साल तक जारी रखें।" },
        { name: "कैल्शियम 500 mg + विटामिन D3 250 IU", dose: "दिन में एक बार", howToTake: "दोपहर के खाने के बाद। टैमोक्सिफेन के दौरान हड्डियों की रक्षा में मदद करता है।" },
      ],
      testsAdvised: ["मैमोग्राम (हर साल)", "पेल्विक अल्ट्रासाउंड (हर साल)", "जिगर की जांच (हर 6 महीने)"],
      followUpInstructions: "अपनी दवा का पत्ता और घर का तापमान/लक्षण रिकॉर्ड साथ लाइए। विज़िट लगभग 30 मिनट की होगी।",
      warningSignsGoER: [
        "अचानक साँस फूलना, तेज़ छाती में दर्द, या खाँसी में खून।",
        "एक पिंडली या जांघ में अचानक सूजन और दर्द (खून का थक्का हो सकता है)।",
        "तेज़ पेट दर्द और लगातार उल्टी जो रुक न रही हो।",
      ],
      warningSignsCallClinic: [
        "स्तन, बगल या गर्दन में कोई नई गांठ — चाहे छोटी ही क्यों न हो।",
        "माहवारी के बीच असामान्य रक्तस्राव या स्राव।",
        "लगातार थकान, पीलिया या बिना कारण वज़न कम होना।",
        "गर्मी के झोंके जो 2 हफ्ते से ज़्यादा नींद ख़राब करें।",
      ],
      careRoutine: [
        "ख़ूब सब्ज़ी, फल और साबुत अनाज खाएँ; लाल मांस कम।",
        "ज़्यादातर दिन 30 मिनट टहलें या हल्का योग करें।",
        "शराब से बचें और धूम्रपान पूरी तरह बंद करें।",
        "अपनी मासिक स्व-जांच का कैलेंडर रखें — एक तारीख चुनें जो याद रहे।",
      ],
    },
    mr: {
      patientName: "सौ. अनीता सिंग",
      doctorName: "डॉ. प्रिया शर्मा",
      clinicName: "थेराक्युअर हेल्थ क्लिनिक",
      whatWeFound: [
        "तुमची वार्षिक स्तनाच्या कर्करोगाची तपासणी समाधानकारक आहे — कोणतीही नवीन गाठ नाही आणि जखम चांगली भरत आहे.",
        "टॅमॉक्सिफेन चांगले सहन होत आहे. कोणतेही नवीन दुष्परिणाम नाहीत.",
        "मागच्या महिन्यातील हाडांची आणि यकृताची तपासणी सामान्य मर्यादेत आहे.",
      ],
      whatToDo: [
        "टॅमॉक्सिफेन 20 mg रोज सकाळी घेणे चालू ठेवा — स्वतःहून बंद करू नका, जरी पूर्णपणे बरे वाटले तरी.",
        "कॅल्शियम + व्हिटॅमिन D3 दिवसातून एकदा, शक्यतो दुपारच्या जेवणानंतर घ्या.",
        "महिन्यातून एकदा घरी स्तनाची स्व-तपासणी करा — पाळीनंतर एका आठवड्याने (किंवा रजोनिवृत्तीनंतर असाल तर त्याच तारखेला).",
        "पुढच्या तपासणीसाठी 3 महिन्यांनी या.",
      ],
      medications: [
        { name: "टॅमॉक्सिफेन 20 mg", dose: "दिवसातून एकदा", howToTake: "रोज एकाच वेळी, जेवणासह किंवा त्याशिवाय. पूर्ण 5 वर्षे चालू ठेवा." },
        { name: "कॅल्शियम 500 mg + व्हिटॅमिन D3 250 IU", dose: "दिवसातून एकदा", howToTake: "दुपारच्या जेवणानंतर. टॅमॉक्सिफेन घेताना हाडांचे रक्षण करण्यास मदत करते." },
      ],
      testsAdvised: ["मॅमोग्राम (दरवर्षी)", "पेल्विक अल्ट्रासाउंड (दरवर्षी)", "यकृत तपासणी (दर 6 महिन्यांनी)"],
      followUpInstructions: "तुमची औषधाची पट्टी आणि घरचा तापमान/लक्षणांचा नोंदी घेऊन या. भेट सुमारे 30 मिनिटे होईल.",
      warningSignsGoER: [
        "अचानक श्वास फुलणे, छातीत तीव्र दुखणे, किंवा खोकल्यातून रक्त.",
        "एका पोटरीत किंवा मांडीत अचानक सूज आणि वेदना (रक्ताची गुठळी असू शकते).",
        "तीव्र पोटदुखी आणि न थांबणारी उलटी.",
      ],
      warningSignsCallClinic: [
        "स्तन, काखे किंवा मानेत कोणतीही नवीन गाठ — अगदी लहान असली तरी.",
        "पाळीदरम्यान असामान्य रक्तस्त्राव किंवा स्त्राव.",
        "सतत थकवा, कावीळ, किंवा कारणाशिवाय वजन कमी होणे.",
        "उष्णतेच्या लाटा ज्यांनी 2 आठवड्यांपेक्षा जास्त झोप उडते.",
      ],
      careRoutine: [
        "भरपूर भाज्या, फळे आणि अख्खे धान्य खा; लाल मांस कमी करा.",
        "बहुतेक दिवस 30 मिनिटे चालत जा किंवा सौम्य योग करा.",
        "मद्यपान टाळा आणि धूम्रपान पूर्णपणे बंद करा.",
        "तुमच्या मासिक स्व-तपासणीचे कॅलेंडर ठेवा — लक्षात राहणारी एक तारीख निवडा.",
      ],
    },
    ta: {
      patientName: "திருமதி. அனிதா சிங்",
      doctorName: "டாக்டர். பிரியா ஷர்மா",
      clinicName: "தெராக்யூர் ஹெல்த் கிளினிக்",
      whatWeFound: [
        "உங்கள் ஆண்டு மார்பக புற்றுநோய் கண்காணிப்பு பரிசோதனை நம்பிக்கை அளிக்கிறது — புதிய கட்டிகள் இல்லை, தழும்பும் நன்றாக ஆறுகிறது.",
        "டாமாக்ஸிஃபென் நன்றாகச் செயல்படுகிறது. புதிய பக்க விளைவுகள் எதுவும் இல்லை.",
        "கடந்த மாத எலும்பு மற்றும் கல்லீரல் பரிசோதனைகள் சாதாரண வரம்பில் உள்ளன.",
      ],
      whatToDo: [
        "டாமாக்ஸிஃபென் 20 mg-ஐ ஒவ்வொரு காலையும் தொடர்ந்து எடுங்கள் — முழுமையாக நலமாக உணர்ந்தாலும் நீங்களாகவே நிறுத்த வேண்டாம்.",
        "கால்சியம் + வைட்டமின் D3-ஐ தினமும் ஒரு முறை, விரும்பினால் மதிய உணவுக்குப் பிறகு எடுங்கள்.",
        "மாதம் ஒருமுறை வீட்டிலேயே மார்பக சுய பரிசோதனை செய்யுங்கள் — மாதவிடாய் முடிந்து ஒரு வாரத்திற்குப் பிறகு (அல்லது மாதவிடாய் நின்றுவிட்டால் அதே தேதியில்).",
        "அடுத்த கண்காணிப்பு பார்வைக்கு 3 மாதங்களில் வாருங்கள்.",
      ],
      medications: [
        { name: "டாமாக்ஸிஃபென் 20 mg", dose: "தினமும் ஒருமுறை", howToTake: "ஒவ்வொரு நாளும் ஒரே நேரத்தில், உணவுடன் அல்லது உணவின்றி. முழு 5 ஆண்டுகள் தொடரவும்." },
        { name: "கால்சியம் 500 mg + வைட்டமின் D3 250 IU", dose: "தினமும் ஒருமுறை", howToTake: "மதிய உணவுக்குப் பிறகு. டாமாக்ஸிஃபென் சாப்பிடும்போது எலும்புகளைப் பாதுகாக்க உதவுகிறது." },
      ],
      testsAdvised: ["மேமோகிராம் (ஆண்டுதோறும்)", "இடுப்பு அல்ட்ராசவுண்ட் (ஆண்டுதோறும்)", "கல்லீரல் பரிசோதனை (ஆறு மாதங்களுக்கு ஒருமுறை)"],
      followUpInstructions: "உங்கள் மருந்து தகடு மற்றும் வீட்டில் எடுக்கப்பட்ட வெப்பநிலை/அறிகுறி குறிப்பேட்டைக் கொண்டு வாருங்கள். பார்வை சுமார் 30 நிமிடங்கள் ஆகும்.",
      warningSignsGoER: [
        "திடீர் மூச்சுத் திணறல், கடுமையான மார்பு வலி அல்லது இரத்தத்துடன் இருமல்.",
        "ஒரு கால் கணுக்கால் அல்லது தொடையில் திடீர் வீக்கம் மற்றும் வலி (இரத்த உறைவு இருக்கலாம்).",
        "கடுமையான வயிற்று வலியுடன் நின்றேயிருக்கும் வாந்தி.",
      ],
      warningSignsCallClinic: [
        "மார்பு, கக்கம் அல்லது கழுத்தில் ஏதேனும் புதிய கட்டி — சிறியதாக இருந்தாலும்.",
        "மாதவிடாய்களுக்கு இடையில் அசாதாரண பெண்ணுறுப்பு இரத்தப்போக்கு அல்லது வெளியேற்றம்.",
        "தொடர்ச்சியான களைப்பு, மஞ்சள் காமாலை அல்லது காரணமற்ற எடை இழப்பு.",
        "2 வாரங்களுக்கு மேல் தூக்கத்தை குலைக்கும் வெப்ப அலைகள்.",
      ],
      careRoutine: [
        "ஏராளமான காய்கறிகள், பழங்கள் மற்றும் முழு தானியங்களை சாப்பிடுங்கள்; சிவப்பு இறைச்சியைக் குறைக்கவும்.",
        "பெரும்பாலான நாட்களில் 30 நிமிடம் நடவுங்கள் அல்லது இலகுவான யோகா செய்யுங்கள்.",
        "மது அருந்துவதைத் தவிர்த்து, புகைபிடிப்பதை முற்றிலும் நிறுத்துங்கள்.",
        "உங்கள் மாதாந்திர சுய பரிசோதனைக்கு ஒரு நாட்காட்டியை வைத்திருங்கள் — நினைவில் வைக்கக்கூடிய தேதியைத் தேர்ந்தெடுக்கவும்.",
      ],
    },
  },
};

/* ─── P004 · Mr. Vikram Patel · Cardiology follow-up ──────────────────── */

const vikramPatelAvs: LocalizedAvsBundle = {
  patientId: "P004",
  static: {
    patientId: "P004",
    patientName: "Mr. Vikram Patel",
    doctorName: "Dr. Priya Sharma",
    clinicName: "TheraCure Health Clinic",
    daysUntilFollowUp: 30,
  },
  text: {
    en: {
      patientName: "Mr. Vikram Patel",
      doctorName: "Dr. Priya Sharma",
      clinicName: "TheraCure Health Clinic",
      whatWeFound: [
        "Your blood pressure today was 148/92 — still a little high. The target is below 130/80.",
        "Your ECG and heart sounds are stable, no new changes from last visit.",
        "Cholesterol (LDL) has come down to 110 mg/dL with the statin. Good progress.",
      ],
      whatToDo: [
        "Increase Telmisartan to 40 mg every morning starting tomorrow.",
        "Continue Atorvastatin 10 mg at bedtime — do not skip.",
        "Continue Aspirin 75 mg after lunch.",
        "Walk for 30 minutes a day, but stop and rest if you feel chest pressure or breathlessness.",
        "Cut down salt: no pickles, papad, or namkeen for the next month.",
      ],
      medications: [
        { name: "Telmisartan 40 mg", dose: "Once daily", howToTake: "First thing in the morning, with a glass of water. Helps lower blood pressure." },
        { name: "Atorvastatin 10 mg", dose: "Once daily", howToTake: "At bedtime. Lowers cholesterol overnight." },
        { name: "Aspirin 75 mg", dose: "Once daily", howToTake: "After lunch, with food. Protects your heart from clots." },
      ],
      testsAdvised: ["Lipid profile (after 6 weeks)", "Serum Creatinine + Electrolytes (after 4 weeks)", "ECG (at next visit)"],
      followUpInstructions: "Bring your home BP log — at least one morning and one evening reading per day. Come 15 minutes early.",
      warningSignsGoER: [
        "Chest pain, pressure, or heaviness lasting more than 5 minutes — even if mild.",
        "Sudden weakness or numbness in face, arm, or leg, especially on one side.",
        "Sudden severe shortness of breath at rest.",
        "Fainting or near-fainting.",
      ],
      warningSignsCallClinic: [
        "Home BP repeatedly above 160/100, or below 100/60 with dizziness.",
        "Swelling of feet or ankles that doesn't go down overnight.",
        "Persistent dry cough after starting Telmisartan.",
        "Muscle pain or unusual weakness (possible statin side effect).",
      ],
      careRoutine: [
        "Measure BP twice a day, sitting quietly for 5 minutes first.",
        "Use less than half a teaspoon of salt per day across all cooking.",
        "Eat fish or dal instead of red meat most days.",
        "Sleep 7–8 hours; manage stress with breathing or prayer for 10 minutes daily.",
      ],
    },
    hi: {
      patientName: "श्री विक्रम पटेल",
      doctorName: "डॉ. प्रिया शर्मा",
      clinicName: "थेराक्योर हेल्थ क्लिनिक",
      whatWeFound: [
        "आज आपका रक्तचाप 148/92 था — अभी थोड़ा ज़्यादा है। लक्ष्य 130/80 से कम है।",
        "आपका ECG और दिल की आवाज़ें स्थिर हैं, पिछली विज़िट से कोई नया बदलाव नहीं।",
        "स्टेटिन से कोलेस्ट्रॉल (LDL) घटकर 110 mg/dL आ गया है। अच्छी प्रगति है।",
      ],
      whatToDo: [
        "कल से टेल्मीसार्टन को 40 mg हर सुबह बढ़ा दें।",
        "एटोरवास्टेटिन 10 mg रात को सोते समय जारी रखें — छूटना नहीं।",
        "एस्पिरिन 75 mg दोपहर के खाने के बाद जारी रखें।",
        "रोज़ 30 मिनट टहलें, लेकिन अगर छाती में दबाव या साँस फूले तो रुककर आराम करें।",
        "नमक कम कीजिए: अगले महीने तक अचार, पापड़ या नमकीन बंद।",
      ],
      medications: [
        { name: "टेल्मीसार्टन 40 mg", dose: "दिन में एक बार", howToTake: "सुबह उठते ही, एक गिलास पानी के साथ। रक्तचाप कम करने में मदद करता है।" },
        { name: "एटोरवास्टेटिन 10 mg", dose: "दिन में एक बार", howToTake: "सोते समय। रात भर में कोलेस्ट्रॉल कम करता है।" },
        { name: "एस्पिरिन 75 mg", dose: "दिन में एक बार", howToTake: "दोपहर के खाने के बाद, खाने के साथ। दिल को थक्कों से बचाता है।" },
      ],
      testsAdvised: ["लिपिड प्रोफ़ाइल (6 हफ्ते बाद)", "सीरम क्रिएटिनिन + इलेक्ट्रोलाइट्स (4 हफ्ते बाद)", "ECG (अगली विज़िट पर)"],
      followUpInstructions: "अपनी घर की BP डायरी लाइए — हर दिन कम से कम एक सुबह और एक शाम का रीडिंग। 15 मिनट पहले पहुँचें।",
      warningSignsGoER: [
        "छाती में दर्द, दबाव या भारीपन जो 5 मिनट से ज़्यादा रहे — भले हल्का ही क्यों न हो।",
        "चेहरे, हाथ या पैर में अचानक कमज़ोरी या सुन्नपन, ख़ासकर एक तरफ।",
        "आराम करते समय अचानक तेज़ साँस फूलना।",
        "बेहोशी या बेहोशी जैसा एहसास।",
      ],
      warningSignsCallClinic: [
        "घर का BP बार-बार 160/100 के ऊपर, या चक्कर के साथ 100/60 से नीचे।",
        "पैरों या टख़नों की सूजन जो रात भर में न उतरे।",
        "टेल्मीसार्टन शुरू करने के बाद लगातार सूखी खाँसी।",
        "मांसपेशियों में दर्द या असामान्य कमज़ोरी (स्टेटिन का साइड इफेक्ट हो सकता है)।",
      ],
      careRoutine: [
        "दिन में दो बार BP नापें, पहले 5 मिनट शांत बैठें।",
        "सारे खाने में मिलाकर रोज़ आधे चम्मच से कम नमक।",
        "लाल मांस की बजाय ज़्यादातर दिन मछली या दाल खाएँ।",
        "7–8 घंटे सोइए; रोज़ 10 मिनट साँस या प्रार्थना से तनाव कम कीजिए।",
      ],
    },
    mr: {
      patientName: "श्री. विक्रम पटेल",
      doctorName: "डॉ. प्रिया शर्मा",
      clinicName: "थेराक्युअर हेल्थ क्लिनिक",
      whatWeFound: [
        "आज तुमचा रक्तदाब 148/92 होता — अजूनही थोडा जास्त आहे. लक्ष्य 130/80 पेक्षा कमी आहे.",
        "तुमचा ECG आणि हृदयाचे आवाज स्थिर आहेत, मागच्या भेटीपासून कोणताही नवीन बदल नाही.",
        "स्टॅटिनमुळे कोलेस्टेरॉल (LDL) 110 mg/dL पर्यंत खाली आला आहे. चांगली प्रगती.",
      ],
      whatToDo: [
        "उद्यापासून टेल्मिसार्टन 40 mg रोज सकाळी वाढवा.",
        "अॅटॉर्व्हास्टॅटिन 10 mg रात्री झोपताना चालू ठेवा — चुकवू नका.",
        "अॅस्पिरिन 75 mg दुपारच्या जेवणानंतर चालू ठेवा.",
        "रोज 30 मिनिटे चाला, पण छातीत दाब किंवा श्वास फुलत असेल तर थांबा आणि विश्रांती घ्या.",
        "मीठ कमी करा: पुढच्या महिन्यात लोणचे, पापड किंवा नमकीन नको.",
      ],
      medications: [
        { name: "टेल्मिसार्टन 40 mg", dose: "दिवसातून एकदा", howToTake: "सकाळी उठल्याबरोबर एक ग्लास पाण्यासह. रक्तदाब कमी करण्यास मदत करते." },
        { name: "अॅटॉर्व्हास्टॅटिन 10 mg", dose: "दिवसातून एकदा", howToTake: "झोपण्याच्या वेळी. रात्रभरात कोलेस्टेरॉल कमी करते." },
        { name: "अॅस्पिरिन 75 mg", dose: "दिवसातून एकदा", howToTake: "दुपारच्या जेवणानंतर, अन्नासह. हृदयाला गुठळ्यांपासून वाचवते." },
      ],
      testsAdvised: ["लिपिड प्रोफाईल (6 आठवड्यांनंतर)", "सीरम क्रिएटिनिन + इलेक्ट्रोलाइट्स (4 आठवड्यांनंतर)", "ECG (पुढच्या भेटीला)"],
      followUpInstructions: "तुमची घरची BP नोंदवही घेऊन या — दररोज किमान एक सकाळची आणि एक संध्याकाळची नोंद. 15 मिनिटे आधी या.",
      warningSignsGoER: [
        "छातीत दुखणे, दाब किंवा जडपणा जो 5 मिनिटांपेक्षा जास्त राहतो — सौम्य असला तरी.",
        "चेहऱ्यावर, हातावर किंवा पायावर अचानक कमजोरी किंवा सुन्नपणा, विशेषतः एका बाजूला.",
        "विश्रांती घेताना अचानक तीव्र श्वासोच्छवास.",
        "बेशुद्धी किंवा बेशुद्धीसारखी जाणीव.",
      ],
      warningSignsCallClinic: [
        "घरचा BP वारंवार 160/100 च्या वर, किंवा चक्करासह 100/60 च्या खाली.",
        "पाय किंवा घोट्यांची सूज जी रात्रभर खाली जात नाही.",
        "टेल्मिसार्टन सुरू केल्यानंतर सतत कोरडा खोकला.",
        "स्नायू दुखणे किंवा असामान्य अशक्तपणा (स्टॅटिनचा दुष्परिणाम असू शकतो).",
      ],
      careRoutine: [
        "दिवसातून दोनदा BP मोजा, आधी 5 मिनिटे शांत बसा.",
        "सर्व स्वयंपाक मिळून रोज अर्ध्या चमच्यापेक्षा कमी मीठ.",
        "लाल मांसाऐवजी बहुतेक दिवस मासे किंवा डाळ खा.",
        "7–8 तास झोपा; रोज 10 मिनिटे श्वासाने किंवा प्रार्थनेने तणाव कमी करा.",
      ],
    },
    ta: {
      patientName: "திரு. விக்ரம் படேல்",
      doctorName: "டாக்டர். பிரியா ஷர்மா",
      clinicName: "தெராக்யூர் ஹெல்த் கிளினிக்",
      whatWeFound: [
        "இன்று உங்கள் இரத்த அழுத்தம் 148/92 — இன்னும் கொஞ்சம் அதிகம். இலக்கு 130/80-க்கு கீழே.",
        "உங்கள் ECG மற்றும் இதய ஓசைகள் நிலையாக உள்ளன, கடைசி சந்திப்புக்குப் பிறகு புதிய மாற்றம் இல்லை.",
        "ஸ்டேட்டின் மருந்தால் கொலஸ்ட்ரால் (LDL) 110 mg/dL-ஆக குறைந்துள்ளது. நல்ல முன்னேற்றம்.",
      ],
      whatToDo: [
        "நாளை முதல் டெல்மிசார்டனை 40 mg-ஆக ஒவ்வொரு காலையும் அதிகரிக்கவும்.",
        "அட்டோர்வாஸ்டேட்டின் 10 mg-ஐ படுக்கைக்கு முன் தொடர்ந்து எடுங்கள் — தவிர்க்க வேண்டாம்.",
        "ஆஸ்பிரின் 75 mg-ஐ மதிய உணவுக்குப் பிறகு தொடரவும்.",
        "தினமும் 30 நிமிடம் நடவுங்கள், ஆனால் மார்பு அழுத்தம் அல்லது மூச்சுத்திணறல் ஏற்பட்டால் நின்று ஓய்வெடுக்கவும்.",
        "உப்பைக் குறைக்கவும்: அடுத்த மாதம் ஊறுகாய், அப்பளம் அல்லது மிக்சர் வேண்டாம்.",
      ],
      medications: [
        { name: "டெல்மிசார்டன் 40 mg", dose: "தினமும் ஒருமுறை", howToTake: "காலையில் முதல் வேலையாக ஒரு கிளாஸ் தண்ணீருடன். இரத்த அழுத்தத்தை குறைக்க உதவுகிறது." },
        { name: "அட்டோர்வாஸ்டேட்டின் 10 mg", dose: "தினமும் ஒருமுறை", howToTake: "படுக்கைக்கு முன். இரவில் கொலஸ்ட்ராலைக் குறைக்கிறது." },
        { name: "ஆஸ்பிரின் 75 mg", dose: "தினமும் ஒருமுறை", howToTake: "மதிய உணவுக்குப் பிறகு, உணவுடன். இதயத்தை இரத்த உறைவுகளிலிருந்து பாதுகாக்கிறது." },
      ],
      testsAdvised: ["லிப்பிட் ப்ரொஃபைல் (6 வாரங்களுக்குப் பிறகு)", "சீரம் கிரியேட்டினின் + எலக்ட்ரோலைட்டுகள் (4 வாரங்களுக்குப் பிறகு)", "ECG (அடுத்த பார்வையில்)"],
      followUpInstructions: "உங்கள் வீட்டு BP குறிப்பேட்டைக் கொண்டு வாருங்கள் — தினசரி குறைந்தது ஒரு காலை மற்றும் ஒரு மாலை அளவீடு. 15 நிமிடம் முன்னதாக வாருங்கள்.",
      warningSignsGoER: [
        "மார்பு வலி, அழுத்தம் அல்லது கனம் 5 நிமிடத்திற்கு மேல் நீடித்தால் — மெல்லியதாக இருந்தாலும்.",
        "முகம், கை அல்லது காலில் திடீர் பலவீனம் அல்லது மரத்துப்போதல், குறிப்பாக ஒரு பக்கத்தில்.",
        "ஓய்வில் இருக்கும்போது திடீர் கடுமையான மூச்சுத்திணறல்.",
        "மயக்கம் அல்லது மயக்கம் போன்ற உணர்வு.",
      ],
      warningSignsCallClinic: [
        "வீட்டு BP தொடர்ந்து 160/100-க்கு மேல், அல்லது தலைச்சுற்றலுடன் 100/60-க்கு கீழே.",
        "இரவில் குறையாத பாதம் அல்லது கணுக்கால் வீக்கம்.",
        "டெல்மிசார்டன் தொடங்கிய பிறகு தொடர்ச்சியான உலர் இருமல்.",
        "தசை வலி அல்லது அசாதாரண பலவீனம் (ஸ்டேட்டின் பக்க விளைவாக இருக்கலாம்).",
      ],
      careRoutine: [
        "BP-ஐ தினமும் இருமுறை அளக்கவும், முதலில் 5 நிமிடம் அமைதியாக உட்காரவும்.",
        "ஒட்டுமொத்த சமையலில் தினமும் அரை தேக்கரண்டிக்கும் குறைவான உப்பு.",
        "சிவப்பு இறைச்சிக்கு பதிலாக பெரும்பாலான நாட்களில் மீன் அல்லது பருப்பு.",
        "7–8 மணி நேரம் தூங்குங்கள்; தினசரி 10 நிமிடம் சுவாசம் அல்லது பிரார்த்தனை மூலம் மன அழுத்தத்தை நிர்வகிக்கவும்.",
      ],
    },
  },
};

/* ─── Registry & lookup helpers ────────────────────────────────────────── */

const BUNDLE_REGISTRY: Record<string, LocalizedAvsBundle> = {
  P002: rajKumarAvs,
  P003: anitaSinghAvs,
  P004: vikramPatelAvs,
};

export function hasLocalizedAvs(patientId: string): boolean {
  return patientId in BUNDLE_REGISTRY;
}

export function getLocalizedAvsBundle(patientId: string): LocalizedAvsBundle | null {
  return BUNDLE_REGISTRY[patientId] ?? null;
}

/**
 * Convert a bundle + locale into a fully-shaped `DigitalAVSData` so the existing
 * AVSView in `DocumentOutputDrawer` can render it without a separate component.
 */
export function buildLocalizedAvs(
  bundle: LocalizedAvsBundle,
  locale: AvsLocale,
  encounterId: string,
): DigitalAVSData {
  const text = bundle.text[locale];
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + bundle.static.daysUntilFollowUp);

  return {
    id: `avs-${bundle.patientId}-${locale}`,
    patientId: bundle.patientId,
    patientName: text.patientName,
    encounterId,
    visitDate: new Date().toISOString(),
    doctorName: text.doctorName,
    clinicName: text.clinicName,
    whatWeFound: text.whatWeFound,
    whatToDo: text.whatToDo,
    medications: text.medications,
    testsAdvised: text.testsAdvised,
    followUpDate: followUpDate.toISOString().split("T")[0],
    followUpInstructions: text.followUpInstructions,
    warningSignsGoER: text.warningSignsGoER,
    warningSignsCallClinic: text.warningSignsCallClinic,
    careRoutine: text.careRoutine,
    language: locale,
    generatedAt: new Date().toISOString(),
    qrPayload: JSON.stringify({
      app: "onetheracure",
      version: "1.0",
      type: "avs",
      patientId: bundle.patientId,
      encounterId,
      locale,
    }),
  };
}
