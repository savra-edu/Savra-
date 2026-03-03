import { HistoryHeader } from "@/features/teacher/history/components/history-header";
import HistoryHero from "@/features/teacher/history/components/history-hero";

export default function HistoryPage() {
    return (
        <div className="flex flex-col h-full p-4 lg:p-8">
            <HistoryHeader className="flex-shrink-0 mb-4" />
            <div className="flex-1 min-h-0 overflow-y-auto">
                <HistoryHero />
            </div>
        </div>
    )
}