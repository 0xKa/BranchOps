import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import arCommon from "./locales/ar/common.json";
import enCommon from "./locales/en/common.json";

const savedLng = (localStorage.getItem("lng") as "en" | "ar" | null) ?? "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    ar: { common: arCommon },
  },
  lng: savedLng,
  fallbackLng: "en",
  ns: ["common"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
