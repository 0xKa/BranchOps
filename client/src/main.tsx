import { StrictMode, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";

import "./i18n";
import i18n from "i18next";
import { applyLangToHtml, langToDir } from "@/lib/i18n-ui";

function Root() {
  const lng = (i18n.language as "en" | "ar") ?? "en";
  const dir = useMemo(() => langToDir(lng), [lng]);

  useEffect(() => {
    applyLangToHtml(lng);
  }, [lng]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DirectionProvider dir={dir}>
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
