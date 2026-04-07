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
    <header className="sticky top-0 z-20 px-4 pt-3 md:px-6">
      <div className="surface-1 flex h-14 shrink-0 items-center gap-2 rounded-xl border border-border/60 px-3 shadow-(--shadow-sm) supports-backdrop-filter:backdrop-blur-(--glass-blur) transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger
            className={`${isRTL ? "-mr-0.5 rotate-180" : "-ml-0.5"} h-8 w-8 rounded-md border border-border/60 bg-background/40 supports-backdrop-filter:backdrop-blur-xs`}
          />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              {pathSegments.map((segment, index) => {
                const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
                const isLast = index === pathSegments.length - 1;

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem className={isLast ? "max-w-[18rem] truncate" : "hidden md:block"}>
                      {isLast ? (
                        <BreadcrumbPage className="font-display text-sm tracking-tight text-foreground">
                          {title || getTranslatedSegment(segment)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link className="text-muted-foreground transition-colors hover:text-foreground" to={href}>
                            {getTranslatedSegment(segment)}
                          </Link>
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
          className={`flex items-center gap-2 rounded-md border border-border/60 bg-background/40 px-2 py-1 supports-backdrop-filter:backdrop-blur-xs ${isRTL ? "mr-auto" : "ml-auto"}`}
        >
          <LanguageToggle size="lg" />
          <ModeToggle size="lg" />
        </div>
      </div>
    </header>
  );
}
