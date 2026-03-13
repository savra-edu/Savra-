"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Users, School, LogOut } from "lucide-react"
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
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid className="w-5 h-5" />, href: "/admin-dashboard" },
    { id: "teachers", label: "Teachers", icon: <Users className="w-5 h-5" />, href: "/teachers" },
    { id: "classrooms", label: "Classrooms", icon: <School className="w-5 h-5" />, href: "/classrooms" },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()
    const [profileOpen, setProfileOpen] = useState(false)
    const profileRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
            }
        }
        if (profileOpen) document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [profileOpen])

    return (
        <div
            className="fixed left-0 top-0 h-[95vh] w-60 rounded-3xl m-4 p-2 flex flex-col border border-[#F5EFEB66]"
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

            {/* Admin Profile Section */}
            <div ref={profileRef} className="p-2 relative">
                <button
                    type="button"
                    onClick={() => setProfileOpen((o) => !o)}
                    className="w-full flex items-center gap-3 rounded-xl p-2 -m-2 transition-all hover:bg-white/40 text-left cursor-pointer"
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
                            School Admin
                        </p>
                        <p className="text-sm font-semibold text-[#242220]">
                            {user?.name || "Loading..."}
                        </p>
                    </div>
                </button>
                {profileOpen && (
                    <div className="absolute bottom-full left-2 right-2 mb-1 py-1 bg-white rounded-xl shadow-lg border border-[#F5EFEB66] z-50">
                        <button
                            type="button"
                            onClick={() => {
                                setProfileOpen(false)
                                logout()
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#F0EAFA] text-left font-medium text-sm text-[#242220]"
                        >
                            <LogOut className="w-5 h-5" />
                            Log out
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
