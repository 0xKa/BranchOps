import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  applyLangToHtml,
  langToDir,
  normalizeLang,
  SUPPORTED_LANGS,
  type AppLang,
  type Dir,
} from "@/locales/utils";

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
    supported: SUPPORTED_LANGS,
  };
}
