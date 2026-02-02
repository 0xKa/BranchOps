import { ThemeProvider } from "@/components/theme/theme-provider";
import { DirectionProvider } from "@/components/ui/direction";
import { useAppLanguage } from "@/hooks/use-app-language";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export default function Root() {
  const { dir } = useAppLanguage();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <DirectionProvider direction={dir} key={dir} dir={dir}>
          <RouterProvider router={router} />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </DirectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
