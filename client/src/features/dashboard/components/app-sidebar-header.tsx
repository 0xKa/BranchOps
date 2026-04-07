import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export default function AppSidebarHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link to="/dashboard">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-primary/35 bg-primary/15 text-primary shadow-(--neon-glow)">
              <img src="/avocado.svg" alt="BranchOps logo" className="size-5" />
            </div>
            <div className="grid flex-1 text-start text-sm leading-tight">
              <span className="truncate font-display text-sm font-semibold tracking-tight">
                BranchOps
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Management System
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
