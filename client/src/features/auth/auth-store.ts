import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email?: string | null;
  role?: string;
  fullName?: string;
  employee?: {
    id: string;
    fullName: string;
    phone?: string | null;
    jobTitle?: string | null;
    isActive: boolean;
    hiredAt?: string | null;
    branch: {
      id: string;
      code: string;
      displayName: string;
      city?: string | null;
      isActive: boolean;
    };
  } | null;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
}

interface AuthState {
  user: User | null;
  tokens: TokenData | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (user: User, tokens: TokenData) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: TokenData) => void;
  setHydrated: (hydrated: boolean) => void;
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isHydrated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user: User, tokens: TokenData) => {
        set({
          user,
          tokens,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (tokens: TokenData) => {
        set({ tokens });
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },

      getAccessToken: () => {
        const state = get();
        return state.tokens?.accessToken ?? null;
      },

      isTokenExpired: () => {
        const state = get();
        if (!state.tokens?.accessTokenExpiresAt) return true;

        const expiresAt = new Date(state.tokens.accessTokenExpiresAt);
        const now = new Date();

        return expiresAt.getTime() - 30000 <= now.getTime();
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

// selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useTokens = () => useAuthStore((state) => state.tokens);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
