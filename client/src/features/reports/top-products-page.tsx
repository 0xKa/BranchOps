import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Crown, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTopProducts } from "./hooks";

const PERIOD_OPTIONS = [
    { value: "7", labelKey: "topProducts.last7Days" },
    { value: "30", labelKey: "topProducts.last30Days" },
    { value: "90", labelKey: "topProducts.last90Days" },
    { value: "all", labelKey: "topProducts.allTime" },
];

const COUNT_OPTIONS = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
];

export default function TopProductsPage() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState("30");
    const [branchFilter, setBranchFilter] = useState("");
    const [count, setCount] = useState("10");

    const days = period === "all" ? null : Number(period);

    const { data, isLoading } = useTopProducts({
        count: Number(count),
        days,
        branchId: branchFilter || undefined,
    });

    const rows = data ?? [];
    const totalRevenue = rows.reduce((s, r) => s + r.totalRevenue, 0);
    const totalQty = rows.reduce((s, r) => s + r.totalQuantitySold, 0);

    return (
        <PageContainer>
            <PageHeader
                title={t("topProducts.title")}
                description={t("topProducts.description")}
            />

            {/* Filters */}
            <div className="surface-1 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 px-3 py-3">
                <div className="space-y-1">
                    <Label className="text-xs">
                        {t("topProducts.branch")}
                    </Label>
                    <BranchFilter
                        value={branchFilter}
                        onValueChange={setBranchFilter}
                        allLabel={t("topProducts.allBranches")}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">
                        {t("topProducts.period")}
                    </Label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-36 h-8 text-xs">
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
                <div className="space-y-1">
                    <Label className="text-xs">
                        {t("topProducts.show")}
                    </Label>
                    <Select value={count} onValueChange={setCount}>
                        <SelectTrigger className="w-20 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {COUNT_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
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
                        icon={<Package className="size-4" />}
                        label={t("topProducts.productsShown")}
                        value={String(rows.length)}
                        toneClass="bg-status-info-soft text-status-info"
                    />
                    <SummaryCard
                        icon={<DollarSign className="size-4" />}
                        label={t("topProducts.totalRevenue")}
                        value={`${totalRevenue.toFixed(3)} ${t("currency")}`}
                        toneClass="bg-status-success-soft text-status-success"
                    />
                    <SummaryCard
                        icon={<ShoppingCart className="size-4" />}
                        label={t("topProducts.totalQtySold")}
                        value={String(totalQty)}
                        toneClass="bg-status-warning-soft text-status-warning"
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
                                <TableHead className="w-12 text-center">
                                    #
                                </TableHead>
                                <TableHead>
                                    {t("topProducts.product")}
                                </TableHead>
                                <TableHead>
                                    {t("topProducts.category")}
                                </TableHead>
                                <TableHead className="text-center">
                                    {t("topProducts.qtySold")}
                                </TableHead>
                                <TableHead className="text-end">
                                    {t("topProducts.revenue")}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((row, idx) => (
                                    <TableRow key={row.productId}>
                                        <TableCell className="text-center">
                                            {idx < 3 ? (
                                                <Crown
                                                    className={`mx-auto size-4 ${rankTone(idx)}`}
                                                />
                                            ) : (
                                                <span className="text-muted-foreground text-sm">
                                                    {idx + 1}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {row.productName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {row.categoryName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.totalQuantitySold}
                                        </TableCell>
                                        <TableCell className="text-end font-medium">
                                            {row.totalRevenue.toFixed(3)}{" "}
                                            {t("currency")}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-8"
                                    >
                                        {t("topProducts.noData")}
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

function rankTone(index: number) {
    if (index === 0) return "text-status-warning";
    if (index === 1) return "text-muted-foreground";
    return "text-chart-3";
}
