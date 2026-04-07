import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
    DollarSign,
    ShoppingCart,
    Store,
    Users,
    AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSalesByBranch } from "./hooks";

const PERIOD_OPTIONS = [
    { value: "7", labelKey: "salesByBranch.last7Days" },
    { value: "30", labelKey: "salesByBranch.last30Days" },
    { value: "90", labelKey: "salesByBranch.last90Days" },
    { value: "all", labelKey: "salesByBranch.allTime" },
];

export default function SalesByBranchPage() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState("30");

    const days = period === "all" ? null : Number(period);

    const { data, isLoading } = useSalesByBranch({ days });

    const rows = data ?? [];
    const totalSales = rows.reduce((s, r) => s + r.totalSales, 0);
    const totalOrders = rows.reduce((s, r) => s + r.orderCount, 0);

    return (
        <PageContainer>
            <PageHeader
                title={t("salesByBranch.title")}
                description={t("salesByBranch.description")}
            />

            {/* Filters */}
            <div className="surface-1 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 px-3 py-3">
                <div className="space-y-1">
                    <Label className="text-xs">
                        {t("salesByBranch.period")}
                    </Label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-44 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PERIOD_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {t(o.labelKey)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            {rows.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        icon={<Store className="size-4" />}
                        label={t("salesByBranch.activeBranches")}
                        value={String(rows.length)}
                        toneClass="bg-status-info-soft text-status-info"
                    />
                    <SummaryCard
                        icon={<DollarSign className="size-4" />}
                        label={t("salesByBranch.totalSales")}
                        value={`${totalSales.toFixed(3)} ${t("currency")}`}
                        toneClass="bg-status-success-soft text-status-success"
                    />
                    <SummaryCard
                        icon={<ShoppingCart className="size-4" />}
                        label={t("salesByBranch.totalOrders")}
                        value={String(totalOrders)}
                        toneClass="bg-chart-3/15 text-chart-3"
                    />
                </div>
            )}

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    {t("salesByBranch.branch")}
                                </TableHead>
                                <TableHead className="text-end">
                                    {t("salesByBranch.sales")}
                                </TableHead>
                                <TableHead className="text-center">
                                    {t("salesByBranch.orders")}
                                </TableHead>
                                <TableHead className="text-center">
                                    {t("salesByBranch.employees")}
                                </TableHead>
                                <TableHead className="text-center">
                                    {t("salesByBranch.lowStock")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <TableRow key={row.branchId}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Store className="size-4 text-muted-foreground" />
                                                {row.branchName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-end font-medium">
                                            {row.totalSales.toFixed(3)}{" "}
                                            {t("currency")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.orderCount}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="size-3 text-muted-foreground" />
                                                {row.employeeCount}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.lowStockItems > 0 ? (
                                                <Badge variant="destructive">
                                                    <AlertTriangle className="size-3 me-1" />
                                                    {row.lowStockItems}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    0
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8"
                                    >
                                        {t("salesByBranch.noData")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </PageContainer>
    );
}

function SummaryCard({
    icon,
    label,
    value,
    toneClass,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    toneClass: string;
}) {
    return (
        <Card className="border-primary/10">
            <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-md p-2 ring-1 ${toneClass}`}>{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-lg font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
