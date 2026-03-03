import TeacherHeader from "@/features/admin/teachers/components/teacher-header";
import DashboardTable from "@/features/admin/teachers/components/teachers-table";


export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col w-full p-8">
            <TeacherHeader />
            <DashboardTable />
        </div>
    )
}