import { StrictMode, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";

import "./i18n";
import { useTranslation } from "react-i18next";
import { applyLangToHtml, langToDir } from "@/lib/i18n-ui";

function Root() {
  const { i18n } = useTranslation();

  const lng = (i18n.resolvedLanguage as "en" | "ar") ?? "en";
  const dir = useMemo(() => langToDir(lng), [lng]);

  useEffect(() => {
    applyLangToHtml(lng);
  }, [lng]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DirectionProvider direction={dir} key={dir} dir={dir}>
        <App />
      </DirectionProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
