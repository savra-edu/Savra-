import QuizAnalyticsDashboard from "@/features/teacher/analytics/components/quiz-analytics-dashboard";
import { QuizAnalyticsHeader } from "@/features/teacher/analytics/components/quiz-analytics-header";



export default function AssessmentsPage() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <QuizAnalyticsHeader className="flex-shrink-0 mb-4" />
            <div className="flex-1 min-h-0 overflow-y-auto">
                <QuizAnalyticsDashboard />
            </div>
        </div>
    )
}