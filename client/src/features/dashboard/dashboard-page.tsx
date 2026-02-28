import PageContainer, { PageHeader } from "@/layouts/page-container";
import { useTranslation } from "react-i18next";
import { useDashboardOverview } from "./hooks/use-dashboard";

import BranchPerformanceList, {
  BranchPerformanceSkeleton,
} from "./components/branch-performance-list";
import LowStockAlerts, {
  LowStockAlertsSkeleton,
} from "./components/low-stock-alerts";
import RecentOrdersTable, {
  RecentOrdersSkeleton,
} from "./components/recent-orders-table";
import {
  SalesAreaChart,
  SalesBarChart,
  SalesChartSkeleton,
} from "./components/sales-charts";
import StatCards, { StatCardsSkeleton } from "./components/stat-cards";
import TopProductsChart, {
  TopProductsSkeleton,
} from "./components/top-products-chart";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDashboardOverview();

  if (isError) {
    return (
      <PageContainer>
        <PageHeader
          title={t("dashboard.welcome")}
          description={t("dashboard.overview")}
        />
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
          <p className="text-sm">{t("common.error")}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={t("dashboard.welcome")}
        description={t("dashboard.overview")}
      />

      {/* ── Stat Cards ──────────────────────────────────────── */}
      {isLoading || !data ? (
        <StatCardsSkeleton />
      ) : (
        <StatCards data={data.summary} />
      )}

      {/* ── Sales Charts Row ────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {isLoading || !data ? (
          <>
            <SalesChartSkeleton />
            <SalesChartSkeleton />
            <SalesChartSkeleton />
          </>
        ) : (
          <>
            <SalesAreaChart
              data={data.todaySales}
              title={t("dashboard.todaysSales")}
            />
            <SalesBarChart
              data={data.weeklySales}
              title={t("dashboard.thisWeek")}
            />
            <SalesAreaChart
              data={data.monthlySales}
              title={t("dashboard.thisMonth")}
            />
          </>
        )}
      </div>

      {/* ── Middle Row: Top Products + Branch Performance ──── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading || !data ? (
          <>
            <TopProductsSkeleton />
            <BranchPerformanceSkeleton />
          </>
        ) : (
          <>
            <TopProductsChart products={data.topProducts} />
            <BranchPerformanceList branches={data.branchPerformance} />
          </>
        )}
      </div>

      {/* ── Bottom Row: Recent Orders + Low Stock Alerts ───── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {isLoading || !data ? (
          <>
            <RecentOrdersSkeleton />
            <LowStockAlertsSkeleton />
          </>
        ) : (
          <>
            <RecentOrdersTable orders={data.recentOrders} />
            <LowStockAlerts alerts={data.lowStockAlerts} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
