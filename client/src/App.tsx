import { useTranslation } from "react-i18next";
import { LangToggle } from "@/components/ui/lang-toggle";
import { ModeToggle } from "@/components/theme/mode-toggle";

export function App() {
  const { t } = useTranslation();

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t("appName")}</h1>
          <LangToggle />
          <ModeToggle size={"icon-lg"} />
        </div>

        <p>{t("hello")}</p>
        <p>{t("lorem")}</p>
        <p>{t("testKey")}</p>
      </div>
    </>
  );
}

export default App;
