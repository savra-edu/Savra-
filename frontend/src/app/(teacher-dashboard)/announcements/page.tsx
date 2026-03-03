import AnnouncementDetails from "@/features/teacher/announcements/components/announcement-details";
import { AnnouncementHeader } from "@/features/teacher/announcements/components/announcement-header";


export default function AssessmentsPage() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <AnnouncementHeader className="flex-shrink-0 mb-4" />
            <div className="flex-1 min-h-0 overflow-hidden">
                <AnnouncementDetails />
            </div>
        </div>
    )
}