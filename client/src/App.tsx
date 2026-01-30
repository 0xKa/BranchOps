import { ComponentExample } from "@/components/component-example";
import { useTranslation } from "react-i18next";
import { LangToggle } from "./components/ui/lang-toggle";

export function App() {
  const { t } = useTranslation();

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t("appName")}</h1>
          <LangToggle />
        </div>

        <p>{t("hello")}</p>
      </div>
      <ComponentExample />
    </>
  );
}

export default App;
