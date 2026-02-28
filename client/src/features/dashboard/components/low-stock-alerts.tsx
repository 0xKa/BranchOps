import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LowStockAlert } from "../types";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Package } from "lucide-react";

function severityLevel(quantity: number, threshold: number) {
    const ratio = quantity / Math.max(threshold, 1);
    if (ratio <= 0.25) return "critical";
    if (ratio <= 0.6) return "warning";
    return "low";
}

function severityColor(level: string) {
    switch (level) {
        case "critical":
            return "text-red-500 bg-red-500/10";
        case "warning":
            return "text-amber-500 bg-amber-500/10";
        default:
            return "text-yellow-500 bg-yellow-500/10";
    }
}

interface LowStockAlertsProps {
    alerts: LowStockAlert[];
}

export default function LowStockAlerts({ alerts }: LowStockAlertsProps) {
    const { t } = useTranslation();

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-500" />
                    {t("dashboard.lowStockAlerts")}
                    {alerts.length > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                            {alerts.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                        <Package className="size-8" />
                        <p className="text-sm">{t("dashboard.noAlerts")}</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-85 overflow-y-auto pr-1">
                        {alerts.map((alert) => {
                            const level = severityLevel(alert.quantity, alert.lowStockThreshold);
                            const colorClass = severityColor(level);
                            return (
                                <div
                                    key={alert.branchStockId}
                                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                                >
                                    <div
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                                    >
                                        <AlertTriangle className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {alert.productName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {alert.branchName}
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <p className="text-sm font-bold tabular-nums">
                                            {alert.quantity}
                                            <span className="text-muted-foreground font-normal">
                                                /{alert.lowStockThreshold}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function LowStockAlertsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-2.5 w-16" />
                        </div>
                        <Skeleton className="h-4 w-10" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
