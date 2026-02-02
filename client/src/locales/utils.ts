export type AppLang = "en" | "ar";
export type Dir = "ltr" | "rtl";

export const SUPPORTED_LANGS: AppLang[] = ["en", "ar"];

export function langToDir(lng: AppLang): Dir {
  return lng === "ar" ? "rtl" : "ltr";
}

export function applyLangToHtml(lng: AppLang) {
  const dir = langToDir(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;

  document.documentElement.classList.toggle("rtl", dir === "rtl");
  document.documentElement.classList.toggle("ltr", dir === "ltr");
}

export function normalizeLang(lng?: string): AppLang {
  const base = (lng ?? "en").split("-")[0];
  return (SUPPORTED_LANGS.includes(base as AppLang) ? base : "en") as AppLang;
}
