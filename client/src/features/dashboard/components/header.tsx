import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link } from "react-router-dom";
import { Fragment } from "react";
import { LanguageToggle } from "@/locales/language-toggle";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useAppLanguage } from "@/hooks/use-app-language";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const location = useLocation();
  const { isRTL } = useAppLanguage();
  const { t } = useTranslation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  const formatSegment = (segment: string) => {
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTranslatedSegment = (segment: string) => {
    const translationKey = `breadcrumb.${segment}`;
    const translated = t(translationKey);
    // If translation key doesn't exist, fall back to formatted segment
    return translated !== translationKey ? translated : formatSegment(segment);
  };

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger
            className={isRTL ? "-mr-1.5 rotate-180" : "-ml-1.5"}
          />
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              {pathSegments.map((segment, index) => {
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem className={isLast ? "" : "hidden md:block"}>
                      {isLast ? (
                        <BreadcrumbPage>
                          {title || getTranslatedSegment(segment)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={href}>{getTranslatedSegment(segment)}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div
          className={`flex items-center gap-3 ${isRTL ? "mr-auto ml-4" : "ml-auto mr-4"}`}
        >
          <LanguageToggle size="lg" />
          <ModeToggle size="lg" />
        </div>
      </header>
      <div className="w-[98%] flex mx-auto">
        <Separator className="mb-4" />
      </div>
    </>
  );
}
