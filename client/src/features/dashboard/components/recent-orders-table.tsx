import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { RecentOrder } from "../types";
import { useTranslation } from "react-i18next";

function statusVariant(status: string) {
    switch (status.toLowerCase()) {
        case "paid":
            return "default" as const;
        case "cancelled":
            return "destructive" as const;
        default:
            return "secondary" as const;
    }
}

function paymentBadge(method: string) {
    switch (method.toLowerCase()) {
        case "cash":
            return "outline" as const;
        case "card":
            return "secondary" as const;
        default:
            return "outline" as const;
    }
}

interface RecentOrdersTableProps {
    orders: RecentOrder[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
    const { t } = useTranslation();
    const currency = t("currency");

    return (
        <Card className="flex flex-col border-primary/10">
            <CardHeader>
                <CardTitle className="font-display">{t("dashboard.recentOrders")}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {orders.length === 0 ? (
                    <p className="px-4 pb-4 text-sm text-muted-foreground">
                        {t("common.noResults")}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("dashboard.branch")}</TableHead>
                                    <TableHead>{t("dashboard.total")}</TableHead>
                                    <TableHead>{t("dashboard.items")}</TableHead>
                                    <TableHead>{t("dashboard.payment")}</TableHead>
                                    <TableHead>{t("dashboard.status")}</TableHead>
                                    <TableHead>{t("dashboard.createdBy")}</TableHead>
                                    <TableHead>{t("dashboard.time")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {order.branchName}
                                        </TableCell>
                                        <TableCell>
                                            {order.total.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}{" "}
                                            {currency}
                                        </TableCell>
                                        <TableCell>{order.itemCount}</TableCell>
                                        <TableCell>
                                            <Badge variant={paymentBadge(order.paymentMethod)}>
                                                {order.paymentMethod}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {order.createdByUserName}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleTimeString(undefined, {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function RecentOrdersSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                ))}
            </CardContent>
        </Card>
    );
}
