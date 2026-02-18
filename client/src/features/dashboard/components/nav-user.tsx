import ProfilePicture from "@/components/shared/ProfilePicture";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLogout } from "@/features/auth/hooks/use-logout";

interface NavUserDisplay {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface NavUserProps {
  user: NavUserDisplay;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { t } = useTranslation();
  const { logout, isPending } = useLogout();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ProfilePicture fullName={user.name} imageUrl={user.avatar} />
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {t(`user.${user.role}`)}
                </span>
              </div>
              <ChevronsUpDown className="ms-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <ProfilePicture fullName={user.name} imageUrl={user.avatar} />
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold text-primary/90">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="me-2 size-4" />
                {t("user.account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="me-2 size-4" />
                {t("nav.settings")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="me-2 size-4" />
                {t("user.notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => logout("/")}
              disabled={isPending}
            >
              <LogOut className="me-2 size-4" />
              {isPending ? "Logging out..." : t("user.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
