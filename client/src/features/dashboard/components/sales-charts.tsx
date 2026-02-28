import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalesChart } from "../types";
import { useTranslation } from "react-i18next";

const areaConfig = {
    totalSales: {
        label: "Sales",
        color: "var(--chart-1)",
    },
    orderCount: {
        label: "Orders",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig;

function fmt(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDate(dateStr: string, period: string) {
    const date = new Date(dateStr);
    if (period === "year")
        return date.toLocaleDateString(undefined, { month: "short" });
    if (period === "month")
        return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    return date.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
    });
}

// ── Area Chart (Today / Month) ─────────────────────────────────
interface SalesAreaChartProps {
    data: SalesChart;
    title: string;
    description?: string;
}

export function SalesAreaChart({
    data,
    title,
    description,
}: SalesAreaChartProps) {
    const { t } = useTranslation();
    const currency = t("currency");

    const chartData = data.dataPoints.map((dp) => ({
        date: formatDate(dp.date, data.period),
        totalSales: dp.totalSales,
        orderCount: dp.orderCount,
    }));

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description ??
                        `${fmt(data.totalSales)} ${currency} · ${data.totalOrders} ${t("dashboard.orders")}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
                <ChartContainer config={areaConfig} className="h-[220px] w-full">
                    <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={fmt} width={40} fontSize={11} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                            dataKey="totalSales"
                            type="monotone"
                            fill="url(#fillSales)"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

// ── Bar Chart (Weekly) ─────────────────────────────────────────
interface SalesBarChartProps {
    data: SalesChart;
    title: string;
    description?: string;
}

export function SalesBarChart({
    data,
    title,
    description,
}: SalesBarChartProps) {
    const { t } = useTranslation();
    const currency = t("currency");

    const barConfig = {
        totalSales: {
            label: "Sales",
            color: "var(--chart-3)",
        },
    } satisfies ChartConfig;

    const chartData = data.dataPoints.map((dp) => ({
        date: formatDate(dp.date, data.period),
        totalSales: dp.totalSales,
        orderCount: dp.orderCount,
    }));

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    {description ??
                        `${fmt(data.totalSales)} ${currency} · ${data.totalOrders} ${t("dashboard.orders")}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
                <ChartContainer config={barConfig} className="h-[220px] w-full">
                    <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} tickFormatter={fmt} width={40} fontSize={11} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar
                            dataKey="totalSales"
                            fill="var(--chart-3)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

// ── Skeleton ───────────────────────────────────────────────────
export function SalesChartSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent className="flex-1 pt-0">
                <Skeleton className="h-[220px] w-full rounded-lg" />
            </CardContent>
        </Card>
    );
}
