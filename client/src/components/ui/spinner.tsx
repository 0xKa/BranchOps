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
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div
        role="status"
        aria-label="Loading"
        className={cn(
          "size-20 animate-spin rounded-full border-2 border-primary/25 border-t-primary shadow-[0_0_30px_hsl(var(--primary)/0.45)]",
          className,
        )}
        {...props}
      ></div>
    </div>
  );
}

export { Spinner, CustomSpinner };
