import StudentsDashboard from "@/features/admin/students/components/students-dashboard";
import StudentsHeader from "@/features/admin/students/components/students-header";


export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col w-full p-8">
            <StudentsHeader />
            <StudentsDashboard />
        </div>
    )
}