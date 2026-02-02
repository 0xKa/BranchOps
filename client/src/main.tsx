import "@/index.css";
import "@/locales/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Root from "./root";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
