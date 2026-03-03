import { Activity } from "@/features/teacher/assessments/components/activity";
import { AssessmentCTA } from "@/features/teacher/assessments/components/assessment-cta";
import { AssessmentHeader } from "@/features/teacher/assessments/components/assessment-header";

export default function AssessmentsPage() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <AssessmentHeader className="flex-shrink-0" />
            <AssessmentCTA className="flex-shrink-0" />
            <div className="flex-1 min-h-0 flex flex-col justify-end">
                <Activity />
            </div>
        </div>
    )
}