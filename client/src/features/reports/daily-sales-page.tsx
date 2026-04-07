import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import BranchFilter from "@/components/shared/branch-filter";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
    CalendarDays,
    DollarSign,
    ShoppingCart,
    Package,
    Ban,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDailySales } from "./hooks";

function defaultFromDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
}

function todayDate(): string {
    return new Date().toISOString().slice(0, 10);
}

export default function DailySalesPage() {
    const { t } = useTranslation();
    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(todayDate);
    const [branchFilter, setBranchFilter] = useState("");

    const { data, isLoading } = useDailySales({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        branchId: branchFilter || undefined,
    });

    const rows = data?.rows ?? [];

    return (
        <PageContainer>
            <PageHeader
                title={t("dailySales.title")}
                description={t("dailySales.description")}
            />

            {/* Filters */}
            <div className="surface-1 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 px-3 py-3">
                <div className="space-y-1">
                    <Label className="text-xs">{t("dailySales.branch")}</Label>
                    <BranchFilter
                        value={branchFilter}
                        onValueChange={setBranchFilter}
                        allLabel={t("dailySales.allBranches")}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">{t("dailySales.from")}</Label>
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-36 h-8 text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">{t("dailySales.to")}</Label>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-36 h-8 text-xs"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            {data && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        icon={<DollarSign className="size-4" />}
                        label={t("dailySales.totalSales")}
                        value={`${data.grandTotalSales.toFixed(3)} ${t("currency")}`}
                        toneClass="bg-status-success-soft text-status-success"
                    />
                    <SummaryCard
                        icon={<ShoppingCart className="size-4" />}
                        label={t("dailySales.totalOrders")}
                        value={String(data.grandTotalOrders)}
                        toneClass="bg-status-info-soft text-status-info"
                    />
                    <SummaryCard
                        icon={<Package className="size-4" />}
                        label={t("dailySales.totalItemsSold")}
                        value={String(data.grandTotalItemsSold)}
                        toneClass="bg-chart-3/15 text-chart-3"
                    />
                    <SummaryCard
                        icon={<Ban className="size-4" />}
                        label={t("dailySales.cancelledOrders")}
                        value={String(data.grandTotalCancelled)}
                        toneClass="bg-status-danger-soft text-status-danger"
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
                                <TableHead>{t("dailySales.date")}</TableHead>
                                <TableHead className="text-center">
                                    {t("dailySales.orders")}
                                </TableHead>
                                <TableHead className="text-end">
                                    {t("dailySales.sales")}
                                </TableHead>
                                <TableHead className="text-end">
                                    {t("dailySales.avgOrder")}
                                </TableHead>
                                <TableHead className="text-center">
                                    {t("dailySales.itemsSold")}
                                </TableHead>
                                <TableHead className="text-center">
                                    {t("dailySales.cancelled")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((row) => (
                                    <TableRow key={row.date}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="size-4 text-muted-foreground" />
                                                {new Date(
                                                    row.date,
                                                ).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.orderCount}
                                        </TableCell>
                                        <TableCell className="text-end font-medium">
                                            {row.totalSales.toFixed(3)}{" "}
                                            {t("currency")}
                                        </TableCell>
                                        <TableCell className="text-end">
                                            {row.averageOrderValue.toFixed(3)}{" "}
                                            {t("currency")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.totalItemsSold}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.cancelledOrders > 0 ? (
                                                <span className="text-destructive font-medium">
                                                    {row.cancelledOrders}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    0
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-8"
                                    >
                                        {t("dailySales.noData")}
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
