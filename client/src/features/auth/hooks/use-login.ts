import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../auth-store";
import { useFetchMe } from "./use-fetch-me";
import { toast } from "sonner";
import { t } from "i18next";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  username: string;
}

const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const res = await api.post<LoginResponse>("/auth/login", data);
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const meMutation = useFetchMe();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginUser,

    onSuccess: async (data) => {
      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
      };

      // Store tokens first so authenticated API calls work
      useAuthStore.getState().setTokens(tokens);

      toast.success(t("login.successMessage"));

      // Fetch full user profile then complete login
      try {
        const user = await meMutation.mutateAsync();
        login(user, tokens);
      } catch (error) {
        console.error(error);
        toast.error("Fetch User Failed", { description: error instanceof Error ? error.message : String(error) });
      }
    },

    onError: (error) => {
      toast.error(t("login.failedMessage"), { description: error.message });
    },
  });
};
