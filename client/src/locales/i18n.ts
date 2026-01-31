import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import arCommon from "@/locales/ar/common.json";
import enCommon from "@/locales/en/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },

    detection: {
      order: ["localStorage", "navigator"], // check localStorage first, then navigator
      caches: ["localStorage"],
      lookupLocalStorage: "lng",
      convertDetectedLanguage: (lng) => {
        const base = lng?.split("-")[0];
        return base === "ar" ? "ar" : "en";
      },
    },
  });

export default i18n;
