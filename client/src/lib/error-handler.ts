import axios from "axios";
import i18n from "@/locales/i18n";

export interface ApiError {
  message: string;
}

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError<ApiError>(error)) {
    if (!error.response) {
      if (error.code === "ERR_NETWORK") {
        throw new Error(i18n.t("errors.networkError"));
      }

      if (error.code === "ECONNABORTED") {
        throw new Error(i18n.t("errors.timeout"));
      }

      throw new Error(i18n.t("errors.serverNotResponding"));
    }

    const message =
      error.response.data?.message ?? i18n.t("errors.unexpectedError");
    throw new Error(message);
  }

  throw new Error(i18n.t("errors.unexpectedError"));
};
