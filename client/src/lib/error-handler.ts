import axios from "axios";

export interface ApiError {
  message: string;
}

export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError<ApiError>(error)) {
    if (!error.response) {
      if (error.code === "ERR_NETWORK") {
        throw new Error("Unable to connect to server.");
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Server took too long to respond.");
      }

      throw new Error("Server is not responding. Please try again later.");
    }

    const message =
      error.response.data?.message ?? "An unexpected error occurred";
    throw new Error(message);
  }

  throw new Error("An unexpected error occurred");
};
