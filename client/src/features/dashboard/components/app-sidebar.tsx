import {
  LayoutDashboard,
  Building2,
  Package,
  ShoppingCart,
  Warehouse,
  BarChart3,
  Users,
  Settings,
  FileText,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import AppSidebarHeader from "./app-sidebar-header";
import { NavUser } from "./nav-user";
import NavMain, { type NavItem } from "./nav-main";
import { useAppLanguage } from "@/hooks/use-app-language";
import { useTranslation } from "react-i18next";
import { useUser } from "@/features/auth/auth-store";
import { USER_ROLE_KEYS } from "@/features/auth/types";
import { filterNavByRole } from "@/lib/route-permissions";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> { }

export default function AppSidebar(props: AppSidebarProps) {
  const user = useUser();
  const { isRTL } = useAppLanguage();
  const { t } = useTranslation();

  // Navigation items with translations
  const mainNavItems: NavItem[] = [
    {
      title: t("nav.dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("nav.branches"),
      url: "/branches",
      icon: Building2,
    },
    {
      title: t("nav.products"),
      url: "/products",
      icon: Package,
      items: [
        { title: t("nav.allProducts"), url: "/products" },
        { title: t("nav.categories"), url: "/products/categories" },
      ],
    },
    {
      title: t("nav.posOrders"),
      url: "/pos",
      icon: ShoppingCart,
      items: [
        { title: t("nav.newOrder"), url: "/pos" },
        { title: t("nav.orderHistory"), url: "/pos/orders" },
      ],
    },
    {
      title: t("nav.inventory"),
      url: "/inventory",
      icon: Warehouse,
      items: [
        { title: t("nav.stockLevels"), url: "/inventory" },
        { title: t("nav.stockAdjustments"), url: "/inventory/adjustments" },
        { title: t("nav.lowStockAlerts"), url: "/inventory/alerts" },
      ],
    },
  ];

  const analyticsNavItems: NavItem[] = [
    {
      title: t("nav.reports"),
      url: "/reports",
      icon: BarChart3,
      items: [
        { title: t("nav.dailySales"), url: "/reports/daily-sales" },
        { title: t("nav.salesByBranch"), url: "/reports/branch-sales" },
        { title: t("nav.topProducts"), url: "/reports/top-products" },
      ],
    },
    {
      title: t("nav.forecasting"),
      url: "/forecasting",
      icon: TrendingUp,
    },
    {
      title: t("nav.auditLog"),
      url: "/audit-log",
      icon: FileText,
    },
  ];

  const adminNavItems: NavItem[] = [
    {
      title: "Admins",
      url: "/admins",
      icon: Users,
    },
    {
      title: "Employees",
      url: "/employees",
      icon: Users,
    },
    {
      title: t("nav.settings"),
      url: "/settings",
      icon: Settings,
    },
  ];

  // Filter nav items based on the user's role
  const role = user?.role ?? null;
  const filteredMain = filterNavByRole(mainNavItems, role);
  const filteredAnalytics = filterNavByRole(analyticsNavItems, role);
  const filteredAdmin = filterNavByRole(adminNavItems, role);

  const currentUser = {
    name: user?.employee?.fullName ?? user?.username ?? "User",
    email: user?.email ?? "",
    role: user?.role != null ? USER_ROLE_KEYS[user.role] : "",
    avatar: "",
  };

  return (
    <Sidebar collapsible="icon" side={isRTL ? "right" : "left"} {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredMain} label={t("nav.main")} />
        {filteredAnalytics.length > 0 && (
          <NavMain items={filteredAnalytics} label={t("nav.analytics")} />
        )}
        {filteredAdmin.length > 0 && (
          <NavMain items={filteredAdmin} label={t("nav.administration")} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
