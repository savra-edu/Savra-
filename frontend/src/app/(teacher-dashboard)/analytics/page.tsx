import QuizDashboard from "@/features/teacher/analytics/components/analytics-dashboard";
import { AnalyticsHeader } from "@/features/teacher/analytics/components/analytics-header";



export default function AssessmentsPage() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <AnalyticsHeader className="flex-shrink-0 mb-4" />
            <div className="flex-1 min-h-0 overflow-y-auto">
                <QuizDashboard />
            </div>
        </div>
    )
}