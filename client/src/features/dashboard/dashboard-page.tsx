import PageContainer from "@/layouts/page-container";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("dashboard.welcome")}</h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("dashboard.totalSales")}
          </h3>
          <p className="text-2xl font-bold mt-2">45,231.89 {t("currency")}</p>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("dashboard.totalOrders")}
          </h3>
          <p className="text-2xl font-bold mt-2">2,350</p>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("dashboard.totalBranches")}
          </h3>
          <p className="text-2xl font-bold mt-2">12</p>
        </div>
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("dashboard.totalProducts")}
          </h3>
          <p className="text-2xl font-bold mt-2">573</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">
            {t("dashboard.todaysSales")}
          </span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">
            {t("dashboard.thisWeek")}
          </span>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <span className="text-muted-foreground">
            {t("dashboard.thisMonth")}
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-muted/50 min-h-75 flex-1 rounded-xl mt-4 p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t("dashboard.recentActivity")}
        </h2>
        <p className="text-muted-foreground">{t("common.noResults")}</p>
      </div>
    </PageContainer>
  );
}
