import { Search, Mic } from "lucide-react";

export default function StudentSearchBar() {
    return (
        <div className="relative w-full sm:w-sm">
            <div className="relative flex items-center px-4 sm:px-8 py-2 rounded-3xl border border-[#C7B1EE]">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-black mr-2 sm:mr-3 flex-shrink-0" />
                
                <input 
                    type="text"
                    placeholder="Ask Savra Ai"
                    className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base placeholder:text-gray-400 text-black"
                />
                
            </div>
        </div>
    )
}