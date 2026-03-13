"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Grid3x3Icon, ListChecksIcon, BellIcon, BarChart3Icon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

function getInitials(name: string | undefined): string {
    if (!name) return "??"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

interface NavItem {
    id: string
    label: string
    icon: React.ReactNode
    href?: string
}

const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: <Grid3x3Icon className="w-5 h-5" />, href: "/student-home" },
    {
        id: "quizzes",
        label: "Quizzes",
        icon: <ListChecksIcon className="w-5 h-5" />,
        href: "/quizzes"
    },
    {
        id: "announcements",
        label: "Announcements",
        icon: <BellIcon className="w-5 h-5" />,
        href: "/announcement"
    },
    {
        id: "leaderboard",
        label: "Leaderboard",
        icon: <BarChart3Icon className="w-5 h-5" />,
        href: "/leaderboard"
    }
]

export function StudentSidebar() {
    const pathname = usePathname()
    const { user } = useAuth()

    return (
        <div
            className="hidden lg:flex fixed left-0 top-0 h-[95vh] w-60 rounded-3xl m-4 p-2 flex-col border border-[#F5EFEB66]"
            style={{ background: "linear-gradient(180deg, #F0EAFA 0%, #EBE6F2 100%)" }}
        >
            {/* Logo */}
            <div>
                <Image src="/images/savra-logo.png" alt="Savra Logo" width={180} height={100} sizes="163px" className="w-[163px] h-[140px]" />
            </div>

            {/* Navigation */}
            <div className="flex-1 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-4 text-[#24222066]">
                    Main
                </p>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        // Check if current pathname matches or starts with the href (for nested routes)
                        const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false
                        const content = (
                            <>
                                <span>{item.icon}</span>
                                <span className="font-medium text-base">{item.label}</span>
                            </>
                        )
                        
                        if (item.href) {
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:cursor-pointer ${isActive ? "bg-[#E8E2F0]" : "hover:bg-white/40"
                                        }`}
                                >
                                    {content}
                                </Link>
                            )
                        }
                        
                        return (
                            <button
                                key={item.id}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:cursor-pointer hover:bg-white/40`}
                            >
                                {content}
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Student Section */}
            <div className="p-2">
                <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-xl transition-all hover:bg-white/40 p-2 -m-2 cursor-pointer"
                >
                    {user?.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold" style={{ color: "oklch(0.3 0 0)" }}>
                                {getInitials(user?.name)}
                            </span>
                        </div>
                    )}
                    <div className="flex flex-col gap-0">
                        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-[#24222066]">
                            Student
                        </p>
                        <p className="text-sm font-semibold text-[#242220]">
                            {user?.name || "Loading..."}
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    )
}
