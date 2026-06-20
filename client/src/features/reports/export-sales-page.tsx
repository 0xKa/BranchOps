import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import BranchFilter from "@/components/shared/branch-filter";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
    Download,
    FileSpreadsheet,
    CalendarRange,
    Layers,
    Filter,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
    exportSalesCsv,
    type ExportGranularity,
    type ExportStatus,
} from "./hooks";

type DateRangePreset =
    | "last7Days"
    | "last30Days"
    | "last3Months"
    | "last6Months"
    | "lastYear"
    | "custom";
type AutomaticDateRangePreset = Exclude<DateRangePreset, "custom">;

const dateRangePresets: DateRangePreset[] = [
    "last7Days",
    "last30Days",
    "last3Months",
    "last6Months",
    "lastYear",
    "custom",
];

function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function dateFromDaysAgo(dayCount: number): string {
    const d = new Date();
    d.setDate(d.getDate() - (dayCount - 1));
    return formatDateInput(d);
}

function dateFromMonthsAgo(monthCount: number): string {
    const today = new Date();
    const d = new Date(today);
    d.setDate(1);
    d.setMonth(d.getMonth() - monthCount);
    const lastDayOfTargetMonth = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0,
    ).getDate();

    d.setDate(Math.min(today.getDate(), lastDayOfTargetMonth));
    return formatDateInput(d);
}

function todayDate(): string {
    return formatDateInput(new Date());
}

function getDateRangeForPreset(preset: AutomaticDateRangePreset) {
    const fromDateByPreset: Record<AutomaticDateRangePreset, string> = {
        last7Days: dateFromDaysAgo(7),
        last30Days: dateFromDaysAgo(30),
        last3Months: dateFromMonthsAgo(3),
        last6Months: dateFromMonthsAgo(6),
        lastYear: dateFromMonthsAgo(12),
    };

    return {
        fromDate: fromDateByPreset[preset],
        toDate: todayDate(),
    };
}

function defaultFromDate(): string {
    return getDateRangeForPreset("last30Days").fromDate;
}

export default function ExportSalesPage() {
    const { t } = useTranslation();

    const [dateRangePreset, setDateRangePreset] =
        useState<DateRangePreset>("last30Days");
    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(todayDate);
    const [branchFilter, setBranchFilter] = useState("");
    const [granularity, setGranularity] = useState<ExportGranularity>("OrderSummary");
    const [status, setStatus] = useState<ExportStatus | "">("");
    const [isExporting, setIsExporting] = useState(false);
    const isCustomDateRange = dateRangePreset === "custom";

    const isValid =
        fromDate &&
        toDate &&
        fromDate <= toDate &&
        (new Date(toDate).getTime() - new Date(fromDate).getTime()) /
            (1000 * 60 * 60 * 24) <=
            366;

    const handleDateRangePresetChange = (preset: DateRangePreset) => {
        setDateRangePreset(preset);

        if (preset === "custom") return;

        const range = getDateRangeForPreset(preset);
        setFromDate(range.fromDate);
        setToDate(range.toDate);
    };

    const handleExport = async () => {
        if (!isValid || isExporting) return;

        setIsExporting(true);
        try {
            await exportSalesCsv({
                fromDate,
                toDate,
                branchId: branchFilter || undefined,
                status: (status as ExportStatus) || undefined,
                granularity,
            });
            toast.success(t("exportSales.exportSuccess"));
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : t("exportSales.exportFailed"),
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title={t("exportSales.title")}
                description={t("exportSales.description")}
            />

            {/* Export Configuration */}
            <div className="surface-1 flex flex-col gap-5 rounded-xl border border-border/60 px-4 py-4">
                {/* Date Range Row */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <CalendarRange className="size-4 text-primary" />
                        <span className="text-sm font-medium">{t("exportSales.dateRange")}</span>
                    </div>
                    <div
                        aria-label={t("exportSales.quickRanges")}
                        className="mb-3 flex flex-wrap gap-2"
                        role="group"
                    >
                        {dateRangePresets.map((preset) => {
                            const isSelected = preset === dateRangePreset;
                            return (
                                <Button
                                    key={preset}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => handleDateRangePresetChange(preset)}
                                    className={isSelected ? "shadow-(--shadow-md)" : undefined}
                                >
                                    {t(`exportSales.${preset}`)}
                                </Button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">{t("exportSales.from")}</Label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                disabled={!isCustomDateRange}
                                className="w-40 h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{t("exportSales.to")}</Label>
                            <Input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                disabled={!isCustomDateRange}
                                className="w-40 h-8 text-xs"
                            />
                        </div>
                    </div>
                    {fromDate && toDate && fromDate > toDate && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {t("exportSales.invalidRange")}
                        </p>
                    )}
                </div>

                <div className="h-px bg-border/40" />

                {/* Filters Row */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="size-4 text-primary" />
                        <span className="text-sm font-medium">{t("exportSales.filters")}</span>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">{t("exportSales.branch")}</Label>
                            <BranchFilter
                                value={branchFilter}
                                onValueChange={setBranchFilter}
                                allLabel={t("exportSales.allBranches")}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{t("exportSales.status")}</Label>
                            <Select
                                value={status || "all"}
                                onValueChange={(v) =>
                                    setStatus(v === "all" ? "" : (v as ExportStatus))
                                }
                            >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {t("exportSales.allStatuses")}
                                    </SelectItem>
                                    <SelectItem value="Paid">
                                        {t("exportSales.paid")}
                                    </SelectItem>
                                    <SelectItem value="Cancelled">
                                        {t("exportSales.cancelled")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border/40" />

                {/* Export Format Row */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Layers className="size-4 text-primary" />
                        <span className="text-sm font-medium">{t("exportSales.format")}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <GranularityOption
                            value="OrderSummary"
                            selected={granularity}
                            onSelect={setGranularity}
                            icon={<FileSpreadsheet className="size-4" />}
                            title={t("exportSales.orderSummary")}
                            description={t("exportSales.orderSummaryDesc")}
                        />
                        <GranularityOption
                            value="ItemDetail"
                            selected={granularity}
                            onSelect={setGranularity}
                            icon={<Layers className="size-4" />}
                            title={t("exportSales.itemDetail")}
                            description={t("exportSales.itemDetailDesc")}
                        />
                    </div>
                </div>
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
                <Button
                    size="lg"
                    disabled={!isValid || isExporting}
                    onClick={handleExport}
                    className="gap-2"
                >
                    {isExporting ? (
                        <Spinner className="size-4" />
                    ) : (
                        <Download className="size-4" />
                    )}
                    {isExporting
                        ? t("exportSales.exporting")
                        : t("exportSales.exportCsv")}
                </Button>
            </div>
        </PageContainer>
    );
}

function GranularityOption({
    value,
    selected,
    onSelect,
    icon,
    title,
    description,
}: {
    value: ExportGranularity;
    selected: ExportGranularity;
    onSelect: (v: ExportGranularity) => void;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    const isSelected = value === selected;
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-start transition-all duration-200 cursor-pointer max-w-72
                ${
                    isSelected
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/60 bg-background/40 hover:border-border hover:bg-muted/30"
                }`}
        >
            <div
                className={`mt-0.5 rounded-md p-1.5 ${
                    isSelected
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                }`}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{title}</span>
                    {isSelected && (
                        <CheckCircle className="size-3.5 text-primary" />
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {description}
                </p>
            </div>
        </button>
    );
}
