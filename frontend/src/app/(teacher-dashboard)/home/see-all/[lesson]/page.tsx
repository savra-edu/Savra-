import LessonDetails from "@/features/teacher/home/components/lesson-details";
import { LessonHeader } from "@/features/teacher/home/components/lesson-header";

export default function LessonPage() {
    return (
        <div className="flex flex-col h-full">
            <LessonHeader/>
            <LessonDetails/>
        </div>
    )
}