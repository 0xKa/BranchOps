import {
    DollarSign,
    ShoppingCart,
    Building2,
    Package,
    Users,
    TrendingUp,
    type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardSummary } from "../types";
import { useTranslation } from "react-i18next";

interface StatCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: "up" | "down" | "neutral";
    accentClass: string;
}

function StatCard({
    label,
    value,
    subtitle,
    icon: Icon,
    accentClass,
}: StatCardProps) {
    return (
        <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-5">
                <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${accentClass}`}
                >
                    <Icon className="size-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-0.5 truncate text-xl font-bold tracking-tight">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function StatCardSkeleton() {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="size-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-2.5 w-24" />
                </div>
            </CardContent>
        </Card>
    );
}

export function StatCardsSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    );
}

function fmt(n: number) {
    return n.toLocaleString(undefined, {
        minimumFractionDigits: n % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2,
    });
}

interface StatCardsProps {
    data: DashboardSummary;
}

export default function StatCards({ data }: StatCardsProps) {
    const { t } = useTranslation();
    const currency = t("currency");

    const cards: StatCardProps[] = [
        {
            label: t("dashboard.totalSales"),
            value: `${fmt(data.totalSales)} ${currency}`,
            subtitle: `${t("dashboard.todaysSales")}: ${fmt(data.totalSalesToday)} ${currency}`,
            icon: DollarSign,
            accentClass: "bg-emerald-500",
        },
        {
            label: t("dashboard.totalOrders"),
            value: fmt(data.totalOrders),
            subtitle: `${t("dashboard.today")}: ${fmt(data.totalOrdersToday)}`,
            icon: ShoppingCart,
            accentClass: "bg-blue-500",
        },
        {
            label: t("dashboard.totalBranches"),
            value: fmt(data.totalBranches),
            subtitle: `${t("dashboard.active")}: ${data.activeBranches}`,
            icon: Building2,
            accentClass: "bg-violet-500",
        },
        {
            label: t("dashboard.totalProducts"),
            value: fmt(data.totalProducts),
            subtitle: `${t("dashboard.active")}: ${data.activeProducts}`,
            icon: Package,
            accentClass: "bg-amber-500",
        },
        {
            label: t("dashboard.employees"),
            value: fmt(data.totalEmployees),
            icon: Users,
            accentClass: "bg-rose-500",
        },
        {
            label: t("dashboard.categories"),
            value: fmt(data.totalCategories),
            icon: TrendingUp,
            accentClass: "bg-cyan-500",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {cards.map((c) => (
                <StatCard key={c.label} {...c} />
            ))}
        </div>
    );
}
