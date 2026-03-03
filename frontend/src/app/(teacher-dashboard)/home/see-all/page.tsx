import LessonPlanner from "@/features/teacher/home/components/lesson-planner";
import { SeeAllHeader } from "@/features/teacher/home/components/see-all-header";

export default function SeeAllPage() {
    return (
        <div className="flex flex-col h-full p-8">
            <SeeAllHeader className="flex-shrink-0 mb-4"/>
            <div className="flex-1 min-h-0 overflow-hidden">
                <LessonPlanner/>
            </div>
        </div>
    )
}