"use client"

import Image from "next/image"
import Link from "next/link"
import { Crown, Star } from "lucide-react"
import { useLeaderboard, useStudentProfile, LeaderboardEntry } from "@/hooks/use-student"

// Generate avatar URL using DiceBear API
function getAvatarUrl(name: string, avatarUrl?: string | null) {
  if (avatarUrl) return avatarUrl
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
}

// Podium colors for positions
const podiumColors = [
  { podiumColor: "bg-[#FEF3C7]", avatarBg: "bg-blue-100" }, // 1st place
  { podiumColor: "bg-[#E9D5FF]", avatarBg: "bg-blue-100" }, // 2nd place
  { podiumColor: "bg-[#FCE7F3]", avatarBg: "bg-blue-100" }, // 3rd place
]

// Loading skeleton
function LeaderboardSkeleton() {
  return (
    <div className="relative flex items-end justify-center gap-4 h-64 px-2">
      {/* 2nd place skeleton */}
      <div className="flex flex-col items-center flex-1 max-w-[100px]">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
        <div className="w-full h-36 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      {/* 1st place skeleton */}
      <div className="flex flex-col items-center flex-1 max-w-[120px]">
        <div className="w-20 h-20 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
        <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
      {/* 3rd place skeleton */}
      <div className="flex flex-col items-center flex-1 max-w-[100px]">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-1 animate-pulse"></div>
        <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  )
}

export function Leaderboard() {
  const { data: leaderboardData, isLoading, error } = useLeaderboard(3)
  const { data: profile } = useStudentProfile()

  // Get class info for display
  const studentClass = profile?.student?.class
  const classDisplay = studentClass
    ? `${studentClass.grade}${studentClass.section ? `-${studentClass.section}` : ""}`
    : ""

  // Ensure we have 3 entries for display (pad with empty if needed)
  const students: (LeaderboardEntry | null)[] = leaderboardData
    ? [...leaderboardData, null, null, null].slice(0, 3)
    : [null, null, null]

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base font-normal text-[#353535]">Leaderboard</h2>
        {classDisplay && <span className="text-gray-600 font-semibold text-sm">{classDisplay}</span>}
      </div>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Failed to load leaderboard.
        </div>
      ) : !students[0] ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No leaderboard data available.
        </div>
      ) : (
        /* Podium Container */
        <div className="relative flex items-end justify-center gap-4 h-64 px-2">
          {/* 2nd Place - Left */}
          {students[1] && (
            <div className="flex flex-col items-center flex-1 max-w-[100px] relative">
              {/* Rank Badge - Positioned above avatar */}
              <div className="absolute -top-1 right-1 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center z-20 shadow-sm">
                <span className="text-gray-700 font-bold text-[10px]">2</span>
              </div>

              {/* Avatar Circle */}
              <div className={`${podiumColors[1].avatarBg} rounded-full w-16 h-16 flex items-center justify-center border-2 border-white shadow-md mb-1 z-10 relative`}>
                <Image
                  src={getAvatarUrl(students[1].name, students[1].avatarUrl)}
                  alt={students[1].name}
                  width={56}
                  height={56}
                  className="rounded-full"
                  unoptimized
                />
              </div>

              {/* Podium Block - Medium Height */}
              <div className={`${podiumColors[1].podiumColor} rounded-lg w-full h-36 flex flex-col items-center justify-end pb-2 shadow-md relative`}>
                <p className="font-bold text-gray-900 text-xs mb-0.5 truncate max-w-full px-1">{students[1].name}</p>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <p className="text-gray-700 font-semibold text-xs">{students[1].totalPoints}</p>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place - Center */}
          {students[0] && (
            <div className="flex flex-col items-center flex-1 max-w-[120px] relative">
              {/* Crown Icon */}
              <div className="absolute -top-3 z-20">
                <Crown className="w-7 h-7 text-yellow-500 fill-yellow-500 drop-shadow-md" />
              </div>

              {/* Avatar Circle - Largest */}
              <div className={`${podiumColors[0].avatarBg} rounded-full w-20 h-20 flex items-center justify-center border-2 border-white shadow-lg mb-1 z-10 relative mt-1`}>
                <Image
                  src={getAvatarUrl(students[0].name, students[0].avatarUrl)}
                  alt={students[0].name}
                  width={72}
                  height={72}
                  className="rounded-full"
                  unoptimized
                />
              </div>

              {/* Podium Block - Tallest */}
              <div className={`${podiumColors[0].podiumColor} rounded-lg w-full h-48 flex flex-col items-center justify-end pb-2 shadow-md relative`}>
                <p className="font-bold text-gray-900 text-sm mb-0.5 truncate max-w-full px-1">{students[0].name}</p>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <p className="text-gray-700 font-semibold text-xs">{students[0].totalPoints}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place - Right */}
          {students[2] && (
            <div className="flex flex-col items-center flex-1 max-w-[100px] relative">
              {/* Rank Badge - Positioned above avatar */}
              <div className="absolute -top-1 left-1 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center z-20 shadow-sm">
                <span className="text-gray-700 font-bold text-[10px]">3</span>
              </div>

              {/* Avatar Circle */}
              <div className={`${podiumColors[2].avatarBg} rounded-full w-16 h-16 flex items-center justify-center border-2 border-white shadow-md mb-1 z-10 relative`}>
                <Image
                  src={getAvatarUrl(students[2].name, students[2].avatarUrl)}
                  alt={students[2].name}
                  width={56}
                  height={56}
                  className="rounded-full"
                  unoptimized
                />
              </div>

              {/* Podium Block - Shortest */}
              <div className={`${podiumColors[2].podiumColor} rounded-lg w-full h-32 flex flex-col items-center justify-end pb-2 shadow-md relative`}>
                <p className="font-bold text-gray-900 text-xs mb-0.5 truncate max-w-full px-1">{students[2].name}</p>
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                  <p className="text-gray-700 font-semibold text-xs">{students[2].totalPoints}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Leaderboard Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/leaderboard"
          className="text-[#7D5CB0] hover:text-[#7C3AED] font-medium text-base flex items-center justify-center gap-1 transition-colors"
        >
          View Leaderboard
          <span className="text-[#8B5CF6]">›</span>
        </Link>
      </div>
    </div>
  )
}
