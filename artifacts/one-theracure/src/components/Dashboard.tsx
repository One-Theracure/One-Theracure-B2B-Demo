
import QuickActions from "@/components/dashboard/QuickActions";
import StatsGrid from "@/components/dashboard/StatsGrid";
import UnifiedAnalyticsSection from "@/components/dashboard/UnifiedAnalyticsSection";

const Dashboard = () => {
  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <QuickActions />
      <StatsGrid />
      <UnifiedAnalyticsSection />
    </div>
  );
};

export default Dashboard;
