"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Language = "en" | "am" | "om";
type Dictionary = Record<string, string>;

const translations: Record<Exclude<Language, "en">, Dictionary> = {
  am: {
    "Login": "ግባ", "Register": "ይመዝገቡ", "Learn by doing": "በመለማመድ ይማሩ", "Find your next skill": "ቀጣዩን ክህሎት ያግኙ",
    "Explore practical programs designed to help turn your interests into real opportunities.": "ፍላጎትዎን ወደ ተግባራዊ ዕድሎች የሚቀይሩ ፕሮግራሞችን ይመልከቱ።",
    "Browse all programs": "ሁሉንም ፕሮግራሞች ይመልከቱ", "View program": "ፕሮግራሙን ይመልከቱ", "Ready when you are": "ሲዘጋጁ ይጀምሩ",
    "Your future is worth investing in.": "ለወደፊትዎ መዋዕለ ንዋይ ማፍሰስ ጠቃሚ ነው።", "Create your account and start building the skills you want to be known for.": "መለያ ይፍጠሩና ሊታወቁበት የሚፈልጉትን ክህሎት ያዳብሩ።",
    "Get started": "ይጀምሩ", "Welcome back": "እንኳን ደህና መጡ", "Enter your registered credentials below": "ከታች የተመዘገቡበትን መረጃ ያስገቡ",
    "Phone Number": "ስልክ ቁጥር", "Password": "የይለፍ ቃል", "Forgot password?": "የይለፍ ቃልዎን ረሱ?", "Sign In": "ግባ", "New Student?": "አዲስ ተማሪ?",
    "Create New Account": "አዲስ መለያ ይፍጠሩ", "Secure SSL Encrypted Connection": "በSSL የተጠበቀ ግንኙነት", "Create Student Account": "የተማሪ መለያ ይፍጠሩ",
    "Register to start your academic registration.": "የትምህርት ምዝገባዎን ለመጀመር ይመዝገቡ።", "Email": "ኢሜይል", "Saving...": "በማስቀመጥ ላይ...", "Continue": "ቀጥል",
    "Complete Your Profile": "መገለጫዎን ያጠናቅቁ", "Fill in your details to continue.": "ለመቀጠል መረጃዎን ያስገቡ።", "First Name": "የመጀመሪያ ስም", "Last Name": "የአባት ስም", "Gender": "ጾታ", "Male": "ወንድ", "Female": "ሴት", "Date of Birth": "የትውልድ ቀን",
    "Overview": "አጠቃላይ እይታ", "Profile": "መገለጫ", "Programs": "ፕሮግራሞች", "Payment": "ክፍያ", "Schedule": "የትምህርት ሰሌዳ", "Student portal": "የተማሪ ፖርታል",
    "Choose Your Program": "ፕሮግራምዎን ይምረጡ", "Select the program you want to register for.": "ለመመዝገብ የሚፈልጉትን ፕሮግራም ይምረጡ።", "No Programs Available": "ምንም ፕሮግራም የለም", "There are currently no active programs.": "በአሁኑ ጊዜ ንቁ ፕሮግራሞች የሉም።", "Duration": "ቆይታ", "Registration Fee": "የምዝገባ ክፍያ", "Select Program": "ፕሮግራም ይምረጡ", "Selecting...": "በመምረጥ ላይ...", "Loading programs...": "ፕሮግራሞች በመጫን ላይ...",
    "My class schedule": "የክፍል ሰሌዳዬ", "Keep track of where and when your classes begin.": "ትምህርቶችዎ የትና መቼ እንደሚጀምሩ ይከታተሉ።", "Refresh schedule": "ሰሌዳውን ያድሱ", "Refreshing…": "በማደስ ላይ…", "Try again": "እንደገና ይሞክሩ", "Loading your schedule…": "ሰሌዳዎ በመጫን ላይ…", "You’re on your way.": "ጉዞዎ ተጀምሯል።", "Your class details are ready. Keep this information handy before your first day.": "የክፍልዎ መረጃ ዝግጁ ነው። ከመጀመሪያው ቀንዎ በፊት ይህን መረጃ ይያዙ።", "Start date": "የመጀመሪያ ቀን", "Start time": "የመጀመሪያ ሰዓት", "Location": "ቦታ", "To be announced": "በኋላ ይገለጻል", "Your schedule is on its way": "የክፍል ሰሌዳዎ በቅርቡ ይዘጋጃል", "Go to dashboard": "ወደ ዳሽቦርድ ይሂዱ", "Back to Dashboard": "ወደ ዳሽቦርድ ተመለስ",
    "Create Account": "መለያ ፍጠር", "Creating Account...": "መለያ በመፍጠር ላይ...", "Confirm password": "የይለፍ ቃሉን ያረጋግጡ", "Please fill in all required fields.": "እባክዎ ሁሉንም አስፈላጊ መረጃዎች ይሙሉ።", "Passwords do not match.": "የይለፍ ቃሎቹ አይዛመዱም።", "Submit Payment": "ክፍያ ያስገቡ", "Upload your payment information for registration.": "ለምዝገባዎ የክፍያ መረጃዎን ይስቀሉ።", "Payment Under Review": "ክፍያው በመገምገም ላይ ነው", "Registration Information": "የምዝገባ መረጃ", "Registration Number": "የምዝገባ ቁጥር", "Uploading Payment...": "ክፍያውን በመስቀል ላይ...", "Previous Payment Rejected": "የቀድሞው ክፍያ ውድቅ ተደርጓል", "Please correct the problem and submit your payment again.": "እባክዎ ችግሩን አስተካክለው ክፍያዎን እንደገና ያስገቡ።", "Payment submitted successfully.": "ክፍያው በተሳካ ሁኔታ ተልኳል።", "Telebirr": "Telebirr", "CBE Birr": "CBE Birr", "Bank Transfer": "የባንክ ዝውውር", "No description available.": "ምንም መግለጫ የለም።", "Not specified": "አልተገለጸም", "Failed to create profile.": "መገለጫ መፍጠር አልተሳካም።", "Failed to load programs.": "ፕሮግራሞችን መጫን አልተሳካም።", "Failed to select program.": "ፕሮግራም መምረጥ አልተሳካም።", "English": "እንግሊዝኛ", "Amharic": "አማርኛ", "Afaan Oromo": "Afaan Oromoo", "Language": "ቋንቋ"
  },
  om: {
    "Login": "Seeni", "Register": "Galmaa'i", "Learn by doing": "Hojjechuun baradhu", "Find your next skill": "Dandeettii itti aanu argadhu",
    "Explore practical programs designed to help turn your interests into real opportunities.": "Sagantaalee fedhii kee carraa qabatamaatti jijjiiran ilaali.", "Browse all programs": "Sagantaalee hunda ilaali", "View program": "Sagantaa ilaali", "Ready when you are": "Yeroo qophoofte jalqabi",
    "Your future is worth investing in.": "Fuuldura keerratti invast gochuun ni gaha.", "Create your account and start building the skills you want to be known for.": "Herrega kee uumi; dandeettii ittiin beekamuu barbaaddu ijaaruu jalqabi.", "Get started": "Jalqabi", "Welcome back": "Baga nagaan deebite", "Enter your registered credentials below": "Odeeffannoo galmee kee armaan gadiitti galchi",
    "Phone Number": "Lakkoofsa Bilbilaa", "Password": "Jecha icciitii", "Forgot password?": "Jecha icciitii irraanfatteettaa?", "Sign In": "Seeni", "New Student?": "Barataa haaraa?", "Create New Account": "Herrega Haaraa Uumi", "Secure SSL Encrypted Connection": "Walqunnamtii SSL'n eegame",
    "Create Student Account": "Herrega Barataa Uumi", "Register to start your academic registration.": "Galmee barnootaa kee jalqabuuf galmaa'i.", "Email": "Imeelii", "Saving...": "Olkaa'aa jira...", "Continue": "Itti fufi", "Complete Your Profile": "Profaayilii kee guuti", "Fill in your details to continue.": "Itti fufuuf odeeffannoo kee guuti.", "First Name": "Maqaa", "Last Name": "Maqaa akaakayyuu", "Gender": "Saala", "Male": "Dhiira", "Female": "Dubara", "Date of Birth": "Guyyaa dhalootaa",
    "Overview": "Cuunfaa", "Profile": "Profaayilii", "Programs": "Sagantaalee", "Payment": "Kaffaltii", "Schedule": "Sagantaa barnootaa", "Student portal": "Poortaalii barattootaa", "Choose Your Program": "Sagantaa kee filadhu", "Select the program you want to register for.": "Sagantaa irratti galmaa'uu barbaaddu filadhu.", "No Programs Available": "Sagantaan hin jiru", "There are currently no active programs.": "Yeroo ammaa sagantaan hojii irra jiru hin jiru.", "Duration": "Turtii", "Registration Fee": "Kaffaltii galmee", "Select Program": "Sagantaa filadhu", "Selecting...": "Filachaa jira...", "Loading programs...": "Sagantaalee fe'aa jira...",
    "My class schedule": "Sagantaa kutaa koo", "Keep track of where and when your classes begin.": "Barnoonni kee eessa fi yoom akka jalqabu hordofi.", "Refresh schedule": "Sagantaa haaromsi", "Refreshing…": "Haaromsaa jira…", "Try again": "Irra deebi'ii yaali", "Loading your schedule…": "Sagantaa kee fe'aa jira…", "You’re on your way.": "Imalli kee jalqabameera.", "Your class details are ready. Keep this information handy before your first day.": "Odeeffannoon kutaa kee qophaa'eera. Guyyaa jalqabaa dura odeeffannoo kana qabadhu.", "Start date": "Guyyaa jalqabaa", "Start time": "Yeroo jalqabaa", "Location": "Iddoo", "To be announced": "Booda beeksifama", "Your schedule is on its way": "Sagantaan kee qophaa'aa jira", "Go to dashboard": "Daashboordii dhaqi", "Back to Dashboard": "Daashboordii deebi'i",
    "Create Account": "Herrega Uumi", "Creating Account...": "Herrega uumaa jira...", "Confirm password": "Jecha icciitii mirkaneessi", "Please fill in all required fields.": "Maaloo odeeffannoo barbaachisu hunda guuti.", "Passwords do not match.": "Jechoonni icciitii wal hin siman.", "Submit Payment": "Kaffaltii galchi", "Upload your payment information for registration.": "Odeeffannoo kaffaltii galmee keetii olkaa'i.", "Payment Under Review": "Kaffaltiin qorannoo irra jira", "Registration Information": "Odeeffannoo galmee", "Registration Number": "Lakkoofsa galmee", "Uploading Payment...": "Kaffaltii olkaa'aa jira...", "Previous Payment Rejected": "Kaffaltiin duraanii fudhatama hin arganne", "Please correct the problem and submit your payment again.": "Maaloo rakkoo sirreessiitii kaffaltii kee irra deebi'ii galchi.", "Payment submitted successfully.": "Kaffaltiin milkaa'inaan ergameera.", "Telebirr": "Telebirr", "CBE Birr": "CBE Birr", "Bank Transfer": "Baankii irraa dabarsuu", "No description available.": "Ibsi hin jiru.", "Not specified": "Hin ibsamne", "Failed to create profile.": "Profaayilii uumuu hin dandeenye.", "Failed to load programs.": "Sagantaalee fe'uu hin dandeenye.", "Failed to select program.": "Sagantaa filachuu hin dandeenye.", "English": "English", "Amharic": "Afaan Amaaraa", "Afaan Oromo": "Afaan Oromoo", "Language": "Afaan"
  }
};

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void };
const LanguageContext = createContext<LanguageContextValue>({ language: "en", setLanguage: () => {} });
const originals = new WeakMap<Node, string>();

function translatePage(language: Language) {
  const dictionary = language === "en" ? null : translations[language];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = node.textContent ?? "";
    const previous = originals.get(node);
    const source = previous !== undefined && (text === previous || Object.values(translations).some((items) => items[previous] === text)) ? previous : text;
    if (previous === undefined || source !== previous) originals.set(node, source);
    const normalized = source.trim().replace(/\s+/g, " ");
    const translated = dictionary?.[normalized];
    if (translated) {
      const leading = source.match(/^\s*/)?.[0] ?? "";
      const trailing = source.match(/\s*$/)?.[0] ?? "";
      const result = `${leading}${translated}${trailing}`;
      if (text !== result) node.textContent = result;
    } else if (text !== source && (text === previous || Object.values(translations).some((items) => items[previous ?? ""] === text))) {
      node.textContent = source;
    }
  }
  document.documentElement.lang = language === "am" ? "am" : language === "om" ? "om" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    localStorage.setItem("student-portal-language", next);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("student-portal-language") as Language | null;
    if (saved === "en" || saved === "am" || saved === "om") {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    translatePage(language);
    const observer = new MutationObserver(() => translatePage(language));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() { return useContext(LanguageContext); }


export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300">
      <span className="sr-only">Language</span>
      <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="rounded-lg border border-white/15 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-blue-400">
        <option value="en">English</option><option value="am">አማርኛ</option><option value="om">Afaan Oromoo</option>
      </select>
    </label>
  );
}
