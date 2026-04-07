import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-4 px-4 pb-4 pt-2 md:gap-5 md:px-6 md:pb-6", className)}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="surface-1 flex flex-col gap-3 rounded-2xl border border-border/60 px-4 py-4 shadow-(--shadow-sm) supports-backdrop-filter:backdrop-blur-(--glass-blur) md:flex-row md:items-center md:justify-between md:px-5">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-[1.7rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        <div
          aria-hidden="true"
          className="mt-3 h-px w-24 bg-linear-to-r from-primary/65 to-transparent"
        />
      </div>
      {children && <div className="flex items-center gap-2 self-start md:self-auto">{children}</div>}
    </div>
  );
}
