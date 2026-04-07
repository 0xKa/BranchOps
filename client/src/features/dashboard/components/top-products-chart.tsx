import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import type { TopSellingProduct } from "../types";
import { useTranslation } from "react-i18next";

const chartConfig = {
    totalRevenue: {
        label: "Revenue",
        color: "var(--chart-1)",
    },
    totalQuantitySold: {
        label: "Qty Sold",
        color: "var(--chart-4)",
    },
} satisfies ChartConfig;

function fmt(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
}

interface TopProductsChartProps {
    products: TopSellingProduct[];
}

export default function TopProductsChart({ products }: TopProductsChartProps) {
    const { t } = useTranslation();
    const currency = t("currency");

    if (products.length === 0) {
        return (
            <Card className="border-primary/10">
                <CardHeader>
                    <CardTitle className="font-display">{t("dashboard.topProducts")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t("common.noResults")}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const chartData = products.slice(0, 8).map((p) => ({
        name: p.productName.length > 14 ? p.productName.slice(0, 14) + "…" : p.productName,
        fullName: p.productName,
        totalRevenue: p.totalRevenue,
        totalQuantitySold: p.totalQuantitySold,
        category: p.categoryName,
    }));

    const topRevenue = products[0];

    return (
        <Card className="flex flex-col border-primary/10">
            <CardHeader className="pb-2">
                <CardTitle className="font-display">{t("dashboard.topProducts")}</CardTitle>
                <CardDescription>
                    {t("dashboard.topProductsDesc", {
                        name: topRevenue.productName,
                        revenue: `${topRevenue.totalRevenue.toLocaleString()} ${currency}`,
                    })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 0, right: 8, top: 4, bottom: 0 }}
                    >
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            width={90}
                            fontSize={11}
                        />
                        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={fmt} fontSize={11} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar
                            dataKey="totalRevenue"
                            fill="var(--chart-1)"
                            radius={[0, 4, 4, 0]}
                            maxBarSize={24}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function TopProductsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[260px] w-full rounded-lg" />
            </CardContent>
        </Card>
    );
}
