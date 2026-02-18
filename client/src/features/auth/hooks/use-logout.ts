import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAuthStore } from "../auth-store";
import { toast } from "sonner";
import { t } from "i18next";

interface LogoutRequest {
  refreshToken: string;
  userId?: string;
}

const logoutUser = async (data: LogoutRequest): Promise<void> => {
  await api.post("/auth/logout", data);
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logoutFromStore = useAuthStore((state) => state.logout);
  const tokens = useAuthStore((state) => state.tokens);
  const user = useAuthStore((state) => state.user);

  const mutation = useMutation({
    mutationFn: logoutUser,

    // clear local state after mutation completes (success or error)
    onSettled: () => {
      logoutFromStore();
      toast.success(t("login.logoutMessage"));
    },
  });

  const logout = (redirectTo: string = "/") => {
    if (tokens?.refreshToken) {
      mutation.mutate(
        {
          refreshToken: tokens.refreshToken,
          userId: user?.id,
        },
        {
          onSettled: () => {
            navigate(redirectTo);
          },
        },
      );
    } else {
      logoutFromStore();
      navigate(redirectTo);
    }
  };

  return {
    logout,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
