import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "./auth-store";
import { toast } from "sonner";
import { t } from "i18next";

type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: string;
  username: string;
};

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

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginUser,

    onSuccess: (data) => {
      // construct user and tokens objects to store in Zustand
      const user = {
        id: data.userId,
        username: data.username,
      };

      const tokens = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
      };

      toast.success(t("login.successMessage"));
      login(user, tokens); // to Zustand store
    },

    onError: (error) => {
      // Show error toast
      toast.error(t("login.failedMessage"), { description: error.message });
    },
  });
};
