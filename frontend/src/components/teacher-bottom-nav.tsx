"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Search, ListChecks, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string; stroke?: string; strokeWidth?: number }>
    href?: string
}

const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/home" },
    {
        id: "lesson-plan",
        label: "Lesson Plan",
        icon: BookOpen,
        href: "/lesson-plan"
    },
    {
        id: "assessments",
        label: "Assessments",
        icon: ListChecks,
        href: "/assessments"
    },
    {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
        href: "/analytics"
    }
]

export function TeacherBottomNav() {
    const pathname = usePathname()

    const renderNavItem = (item: NavItem) => {
        const isActive = item.href ? (pathname === item.href || pathname.startsWith(item.href + "/")) : false
        
        if (item.href) {
            return (
                <Link
                    key={item.id}
                    href={item.href}
                    className="flex-1 max-w-[80px]"
                >
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full flex flex-col items-center justify-center gap-1 h-14 rounded-xl transition-all",
                            !isActive && "hover:bg-gray-100"
                        )}
                    >
                        <item.icon
                            className={cn(
                                "transition-all",
                                isActive ? "w-7 h-7 scale-110" : "w-6 h-6"
                            )}
                            stroke={isActive ? "#242220" : "#8C8C8C"}
                            strokeWidth={isActive ? 2 : 1.5}
                        />
                        <span className={cn(
                            "text-xs transition-all",
                            isActive ? "font-bold text-[#242220]" : "font-medium text-[#8C8C8C]"
                        )}>{item.label}</span>
                    </Button>
                </Link>
            )
        }

        return (
            <Button
                key={item.id}
                variant="ghost"
                className="flex-1 max-w-[80px] flex flex-col items-center justify-center gap-1 h-14 rounded-xl transition-all hover:bg-gray-100"
            >
                <item.icon className="w-6 h-6" stroke="#8C8C8C" strokeWidth={1.5} />
                <span className="text-xs font-medium">{item.label}</span>
            </Button>
        )
    }

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex items-center justify-around px-2 py-2 h-16">
                {/* Home */}
                {renderNavItem(navItems[0])}
                
                {/* Lesson Plan */}
                {renderNavItem(navItems[1])}
                
                {/* Center Search Button */}
                <div className="flex-shrink-0 mx-2">
                    <Link href="/ask-savra-page">
                        <Button
                            className={cn(
                                "w-12 h-12 rounded-full bg-[#9B61FF] hover:bg-[#7C3AED] text-white shadow-lg flex items-center justify-center p-0",
                                pathname === "/ask-savra-page" && "bg-[#7C3AED]"
                            )}
                            size="icon"
                        >
                            <Search className="w-6 h-6" />
                        </Button>
                    </Link>
                </div>
                
                {/* Assessments */}
                {renderNavItem(navItems[2])}
                
                {/* Analytics */}
                {renderNavItem(navItems[3])}
            </div>
        </nav>
    )
}
