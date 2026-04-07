import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  Home,
  ArrowLeft,
  RefreshCw,
  ServerCrash,
  Lock,
  FileQuestion,
  Ban,
} from "lucide-react";

interface ErrorDetails {
  title: string;
  message: string;
  icon: React.ReactNode;
  suggestion?: string;
}

interface ErrorStateProps {
  status?: number;
  message?: string;
  error?: Error;
  showRefresh?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
}

const getErrorDetails = (
  status?: number,
  customMessage?: string,
): ErrorDetails => {
  switch (status) {
    case 400:
      return {
        title: "Bad Request",
        message:
          customMessage || "The request could not be understood by the server.",
        icon: <AlertCircle className="size-16 text-destructive" />,
        suggestion: "Please check your input and try again.",
      };
    case 401:
      return {
        title: "Unauthorized",
        message:
          customMessage ||
          "You need to be authenticated to access this resource.",
        icon: <Lock className="size-16 text-destructive" />,
        suggestion: "Please log in and try again.",
      };
    case 403:
      return {
        title: "Forbidden",
        message:
          customMessage || "You don't have permission to access this resource.",
        icon: <Ban className="size-16 text-destructive" />,
        suggestion: "If you believe this is an error, please contact support.",
      };
    case 404:
      return {
        title: "Page Not Found",
        message: customMessage || "The page you're looking for doesn't exist.",
        icon: <FileQuestion className="size-16 text-destructive" />,
        suggestion: "The page may have been moved or deleted.",
      };
    case 500:
      return {
        title: "Internal Server Error",
        message: customMessage || "Something went wrong on our end.",
        icon: <ServerCrash className="size-16 text-destructive" />,
        suggestion: "We're working to fix this. Please try again later.",
      };
    case 502:
      return {
        title: "Bad Gateway",
        message: customMessage || "The server received an invalid response.",
        icon: <ServerCrash className="size-16 text-destructive" />,
        suggestion: "Please try again in a few moments.",
      };
    case 503:
      return {
        title: "Service Unavailable",
        message: customMessage || "The service is temporarily unavailable.",
        icon: <ServerCrash className="size-16 text-destructive" />,
        suggestion: "We're performing maintenance. Please try again later.",
      };
    default:
      return {
        title: "Something Went Wrong",
        message: customMessage || "An unexpected error occurred.",
        icon: <AlertCircle className="size-16 text-destructive" />,
        suggestion:
          "Please try refreshing the page or contact support if the problem persists.",
      };
  }
};

export default function ErrorState({
  status,
  message,
  error,
  showRefresh = true,
  showGoBack = true,
  showGoHome = true,
}: ErrorStateProps) {
  const navigate = useNavigate();
  const routeError = useRouteError();

  // Use route error if no explicit error is provided
  const actualError = error || routeError;

  // Extract status and message from error if provided
  let errorStatus = status;
  let errorMessage = message;

  if (isRouteErrorResponse(actualError)) {
    errorStatus = actualError.status;
    errorMessage = actualError.statusText || message;
  } else if (actualError instanceof Error) {
    errorMessage = actualError.message;
  }

  const errorDetails = getErrorDetails(errorStatus, errorMessage);

  const handleRefresh = () => window.location.reload();

  const handleGoBack = () => navigate(-1);

  const handleGoHome = () => navigate("/");

  return (
    <div className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 -right-8 h-80 w-80 rounded-full bg-neon-cyan/15 blur-3xl" />
      </div>

      <Card className="surface-1 relative w-full max-w-lg border-border/60 shadow-glow-subtle">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-2xl border border-destructive/35 bg-destructive/12 p-4">
              {errorDetails.icon}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {errorStatus && (
              <span className="text-destructive">{errorStatus}</span>
            )}
            {" - "}
            {errorDetails.title}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {errorDetails.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {errorDetails.suggestion && (
            <p className="text-muted-foreground text-sm">
              {errorDetails.suggestion}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 mt-3 justify-center">
          {showGoHome && (
            <Button
              onClick={handleGoHome}
              variant="default"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Home className="mr-2" />
              Go Home
            </Button>
          )}
          {showGoBack && (
            <Button
              onClick={handleGoBack}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2" />
              Go Back
            </Button>
          )}
          {showRefresh && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2" />
              Refresh
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
