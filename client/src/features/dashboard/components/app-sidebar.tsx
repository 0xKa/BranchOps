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
import { NavUser, type User } from "./nav-user";
import NavMain, { type NavItem } from "./nav-main";

// Navigation items configuration
const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Branches",
    url: "/branches",
    icon: Building2,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    items: [
      { title: "All Products", url: "/products" },
      { title: "Categories", url: "/products/categories" },
    ],
  },
  {
    title: "POS / Orders",
    url: "/pos",
    icon: ShoppingCart,
    items: [
      { title: "New Order", url: "/pos" },
      { title: "Order History", url: "/pos/orders" },
    ],
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Warehouse,
    items: [
      { title: "Stock Levels", url: "/inventory" },
      { title: "Stock Adjustments", url: "/inventory/adjustments" },
      { title: "Low Stock Alerts", url: "/inventory/alerts" },
    ],
  },
];

const analyticsNavItems: NavItem[] = [
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    items: [
      { title: "Daily Sales", url: "/reports/daily-sales" },
      { title: "Sales by Branch", url: "/reports/branch-sales" },
      { title: "Top Products", url: "/reports/top-products" },
    ],
  },
  {
    title: "Forecasting",
    url: "/forecasting",
    icon: TrendingUp,
  },
  {
    title: "Audit Log",
    url: "/audit-log",
    icon: FileText,
  },
];

const adminNavItems: NavItem[] = [
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

// Placeholder user data
const currentUser: User = {
  name: "Reda Hilal",
  email: "reda@branchops.com",
  role: "Admin",
  avatar: "",
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export default function AppSidebar(props: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainNavItems} label="Main" />
        <NavMain items={analyticsNavItems} label="Analytics" />
        <NavMain items={adminNavItems} label="Administration" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
