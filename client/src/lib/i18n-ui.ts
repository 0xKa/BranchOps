export type AppLang = "en" | "ar";
export type Dir = "ltr" | "rtl";

export function langToDir(lng: AppLang): Dir {
  return lng === "ar" ? "rtl" : "ltr";
}

export function applyLangToHtml(lng: AppLang) {
  const dir = langToDir(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = dir;

  // class hooks
  document.documentElement.classList.toggle("rtl", dir === "rtl");
  document.documentElement.classList.toggle("ltr", dir === "ltr");
}
