import { AdminFilterBar } from "@/components/admin-filter-bar";
import AdminSearchBar from "@/components/admin-search-bar";

export default function StudentsHeader() {
    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-6">
            <div>
                <h1 className="text-2xl font-bold text-3xl text-[#353535]">Classrooms</h1>
                <p className="text-[#353535] text-base">An overview of the student activity</p>
            </div>
            <div className="flex items-center gap-4">
                <AdminSearchBar />
                <AdminFilterBar />
            </div>
        </div>
    )
}