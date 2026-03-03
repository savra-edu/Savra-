import { Search, Mic } from "lucide-react";

export default function AdminSearchBar() {
    return (
        <div className="relative w-sm">
            <div className="relative flex items-center px-8 py-2 rounded-3xl border border-[#C7B1EE]">
                <Search className="w-5 h-5 text-black mr-3 flex-shrink-0" />
                
                <input 
                    type="text"
                    placeholder="Ask Savra Ai"
                    className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-gray-400 text-black"
                />
                
            </div>
        </div>
    )
}