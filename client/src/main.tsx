import { ThemeProvider } from "@/components/theme/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import "@/index.css";
import { applyLangToHtml, langToDir } from "@/lib/i18n-ui";
import "@/locales/i18n.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

function Root() {
  const { i18n } = useTranslation();

  const lng = (i18n.resolvedLanguage as "en" | "ar") ?? "en";
  const dir = useMemo(() => langToDir(lng), [lng]);

  useEffect(() => {
    applyLangToHtml(lng);
  }, [lng]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <DirectionProvider direction={dir} key={dir} dir={dir}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </DirectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
