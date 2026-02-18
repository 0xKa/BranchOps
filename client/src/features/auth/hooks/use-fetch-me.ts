import { api } from "@/services/api";
import { handleApiError } from "@/lib/error-handler";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../auth-store";
import type { User } from "../types";

async function fetchMe(): Promise<User> {
  try {
    const res = await api.get<User>("/auth/me");
    return res.data;

  } catch (error) {
    return handleApiError(error);
  }
}

export const useFetchMe = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<User, Error, void>({
    mutationFn: fetchMe,
    onSuccess: (user) => {
      setUser(user);
    },
  });
};
