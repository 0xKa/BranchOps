import { handleApiError } from "@/lib/error-handler";
import { api } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "./authStore";

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

      // Store in Zustand (also persists to localStorage via middleware)
      login(user, tokens);

      // console.log("Login successful - user authenticated:", user.username);
    },

    // onError: (error) => {
    //   console.log("Login failed:", error.message);
    // },
  });
};
