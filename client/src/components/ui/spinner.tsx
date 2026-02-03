import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

function CustomSpinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className={cn(
          "animate-spin rounded-full size-20 border-b-2 border-primary",
          className,
        )}
        {...props}
      ></div>
    </div>
  );
}

export { Spinner, CustomSpinner };
