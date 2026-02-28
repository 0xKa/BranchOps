import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { BranchPerformance } from "../types";
import { useTranslation } from "react-i18next";
import { Building2, ShoppingCart, Users, AlertTriangle } from "lucide-react";

interface BranchPerformanceListProps {
    branches: BranchPerformance[];
}

export default function BranchPerformanceList({
    branches,
}: BranchPerformanceListProps) {
    const { t } = useTranslation();
    const currency = t("currency");

    if (branches.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t("dashboard.branchPerformance")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t("common.noResults")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const maxSales = Math.max(...branches.map((b) => b.totalSales), 1);

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    {t("dashboard.branchPerformance")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {branches.map((branch) => {
                    const pct = (branch.totalSales / maxSales) * 100;
                    return (
                        <div
                            key={branch.branchId}
                            className="space-y-2 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                    {branch.branchName}
                                </span>
                                <span className="text-sm font-bold tabular-nums">
                                    {branch.totalSales.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                    })}{" "}
                                    {currency}
                                </span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="gap-1">
                                    <ShoppingCart className="size-3" />
                                    {branch.orderCount} {t("dashboard.orders")}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <Users className="size-3" />
                                    {branch.employeeCount}
                                </Badge>
                                {branch.lowStockItems > 0 && (
                                    <Badge variant="destructive" className="gap-1">
                                        <AlertTriangle className="size-3" />
                                        {branch.lowStockItems} {t("dashboard.lowStock")}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}

export function BranchPerformanceSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 rounded-lg border p-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-1.5 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
