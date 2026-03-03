import AdminDashboardHeader from "@/features/admin/dashboard/dashboard-header";
import InsightsDashboard from "@/features/admin/dashboard/dashboard-insights";


export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col max-w-full p-8">
            <AdminDashboardHeader />
            <InsightsDashboard/>
        </div>
    )
}