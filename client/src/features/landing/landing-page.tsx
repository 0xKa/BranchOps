import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/locales/language-toggle";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <div>
      landing-page
      <p>{t("testKey")}</p>
      <div dir="ltr" className="inline-flex">
        <LanguageToggle />
      </div>
      <div>
        <Button size="lg" onClick={() => navigate("/dashboard")}>
          Dashboard
        </Button>
      </div>
    </div>
  );
}
