"use client"

import SearchBar from "@/components/search-bar";
import { Bell, Clock, UserCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function HomeHeader() {
    const { user } = useAuth();
    const firstName = user?.name?.split(" ")[0] || "Teacher";

    return (
        <div className="flex flex-row justify-between items-center border-b border-gray-200 pb-4 flex-shrink-0">
            <div className="flex items-center gap-1">
                <Link href="/user-profile" className="lg:hidden">
                    <UserCircle className="w-6 h-6 bg-gray-200 rounded-full text-gray-700" />
                </Link>
                <div>
                    <h1 className="text-base lg:text-3xl font-bold text-[#242220]">Hi, {firstName}!</h1>
                    <p className="text-sm lg:text-lg text-[#353535] font-medium">Hope you're having a good day</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="hidden lg:block">
                    <SearchBar />
                </div>
                <div className="lg:hidden flex items-center gap-3">
                    <Link href="/announcements" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Bell className="w-5 h-5 text-gray-700" />
                    </Link>
                    <Link href="/history" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Clock className="w-5 h-5 text-gray-700" />
                    </Link>
                </div>
            </div>
        </div>
    )
}