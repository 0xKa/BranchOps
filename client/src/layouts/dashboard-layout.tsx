import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "../features/dashboard/components/app-sidebar";
import Header from "../features/dashboard/components/header";

export default function DashboardLayout() {
  const location = useLocation();
  const isFixedViewportPage = location.pathname === "/reports/branchops-agent";

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className={isFixedViewportPage ? "h-svh min-h-0 overflow-hidden" : undefined}>
          <Header />
          {isFixedViewportPage ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
