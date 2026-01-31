import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

export type AppLang = "en" | "ar";
export type Dir = "ltr" | "rtl";
const SUPPORTED: AppLang[] = ["en", "ar"];

function langToDir(lng: AppLang): Dir {
  return lng === "ar" ? "rtl" : "ltr";
}

function applyLangToHtml(lng: AppLang) {
  const dir = langToDir(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;

  // class hooks
  document.documentElement.classList.toggle("rtl", dir === "rtl");
  document.documentElement.classList.toggle("ltr", dir === "ltr");
}

function normalizeLang(lng?: string): AppLang {
  const base = (lng ?? "en").split("-")[0];
  return (SUPPORTED.includes(base as AppLang) ? base : "en") as AppLang;
}

export function useAppLanguage() {
  const { i18n } = useTranslation();

  const lang = normalizeLang(i18n.resolvedLanguage);
  const dir: Dir = useMemo(() => langToDir(lang), [lang]);

  useEffect(() => {
    // keep html attributes always in sync
    applyLangToHtml(lang);
  }, [lang]);

  const setLang = useCallback(
    async (next: AppLang) => {
      const normalized = normalizeLang(next);
      await i18n.changeLanguage(normalized);
      //   localStorage.setItem("lng", normalized); // handled by i18next-browser-languagedetector caching
    },
    [i18n],
  );

  const toggleLang = useCallback(async () => {
    await setLang(lang === "en" ? "ar" : "en");
  }, [lang, setLang]);

  return {
    lang,
    dir,
    isRTL: dir === "rtl",
    setLang,
    toggleLang,
    supported: SUPPORTED,
  };
}
