"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Coins, Crown, Star } from "lucide-react"
import { useFullLeaderboard, LeaderboardRanking } from "@/hooks/use-student"

interface LeaderboardStandingsProps {
  searchQuery?: string
}

const getAvatarUrl = (name: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <>
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-8"></div>
      <div className="bg-[#FDF7FE] rounded-lg shadow-sm border border-gray-100 p-6 w-full h-full flex flex-col">
        {/* Podium skeleton */}
        <div className="relative flex items-end justify-center gap-6 mb-8 h-72">
          {/* 2nd place */}
          <div className="flex flex-col items-center flex-1 max-w-[140px]">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 animate-pulse"></div>
            <div className="w-full h-40 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          {/* 1st place */}
          <div className="flex flex-col items-center flex-1 max-w-[160px]">
            <div className="w-24 h-24 bg-gray-200 rounded-full mb-2 animate-pulse"></div>
            <div className="w-full h-52 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          {/* 3rd place */}
          <div className="flex flex-col items-center flex-1 max-w-[140px]">
            <div className="w-20 h-20 bg-gray-200 rounded-full mb-2 animate-pulse"></div>
            <div className="w-full h-36 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        {/* List skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 h-5 bg-gray-200 rounded"></div>
              <div className="w-16 h-5 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function LeaderboardStandings({ searchQuery = "" }: LeaderboardStandingsProps) {
  const { data: leaderboardData, isLoading, error } = useFullLeaderboard()

  // Filter rankings by search query
  const filteredRankings = useMemo(() => {
    if (!leaderboardData?.rankings) return []

    if (!searchQuery) return leaderboardData.rankings

    const query = searchQuery.toLowerCase()
    return leaderboardData.rankings.filter((student) =>
      student.name.toLowerCase().includes(query)
    )
  }, [leaderboardData?.rankings, searchQuery])

  // Split into top 3 and others
  const topThree = filteredRankings.slice(0, 3)
  const otherStudents = filteredRankings.slice(3)

  // Get class display string
  const classDisplay = !leaderboardData
    ? "Loading..."
    : leaderboardData.class
      ? `Grade: ${leaderboardData.class.grade}${leaderboardData.class.section ? `-${leaderboardData.class.section}` : ""}`
      : "No class assigned"

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // Error state
  if (error) {
    return (
      <>
        <h1 className="text-2xl font-bold text-[#353535] mb-8">Leaderboard</h1>
        <div className="bg-[#FDF7FE] rounded-lg shadow-sm border border-gray-100 p-6 w-full h-64 flex items-center justify-center">
          <p className="text-gray-500">Failed to load leaderboard. Please try again.</p>
        </div>
      </>
    )
  }

  // Empty state
  if (!filteredRankings.length) {
    return (
      <>
        <h1 className="text-2xl font-bold text-[#353535] mb-8">{classDisplay}</h1>
        <div className="bg-[#FDF7FE] rounded-lg shadow-sm border border-gray-100 p-6 w-full h-64 flex items-center justify-center">
          <p className="text-gray-500">
            {searchQuery ? "No students match your search" : "No leaderboard data available"}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#353535] mb-8">{classDisplay}</h1>
      <div className="bg-[#FDF7FE] rounded-lg shadow-sm border border-gray-100 p-6 w-full h-full flex flex-col">
        {/* Top 3 Podium */}
        {topThree.length >= 3 && (
          <div className="relative flex items-end justify-center gap-6 mb-8 h-72">
            {/* 2nd Place - Left */}
            <div className="flex flex-col items-center flex-1 max-w-[140px] relative">
              {/* Rank Badge */}
              <div className="absolute -top-2 right-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-20 shadow-sm">
                <span className="text-gray-700 font-bold text-xs">2</span>
              </div>

              {/* Avatar Circle */}
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center border-2 border-white shadow-lg mb-2 z-10 relative">
                <Image
                  src={getAvatarUrl(topThree[1].name)}
                  alt={topThree[1].name}
                  width={72}
                  height={72}
                  sizes="72px"
                  className="rounded-full"
                  unoptimized
                />
              </div>

              {/* Podium Block - Medium Height */}
              <div className="bg-[#E9D5FF] rounded-xl w-full h-40 flex flex-col items-center justify-end pb-3 shadow-lg relative">
                <p className="font-bold text-gray-900 text-sm text-center mb-1">{topThree[1].name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <p className="text-gray-700 font-semibold text-sm">{topThree[1].points}</p>
                  {topThree[1].isCurrentUser && (
                    <span className="bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 ml-1">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 1st Place - Center */}
            <div className="flex flex-col items-center flex-1 max-w-[160px] relative">
              {/* Crown Icon */}
              <div className="absolute -top-4 z-20">
                <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500 drop-shadow-md" />
              </div>

              {/* Avatar Circle - Largest */}
              <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center border-2 border-white shadow-xl mb-2 z-10 relative mt-1">
                <Image
                  src={getAvatarUrl(topThree[0].name)}
                  alt={topThree[0].name}
                  width={88}
                  height={88}
                  sizes="88px"
                  className="rounded-full"
                  unoptimized
                />
              </div>

              {/* Podium Block - Tallest */}
              <div className="bg-[#FEF3C7] rounded-xl w-full h-52 flex flex-col items-center justify-end pb-3 shadow-lg relative">
                <p className="font-bold text-gray-900 text-base text-center mb-1">{topThree[0].name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <p className="text-gray-700 font-semibold text-sm">{topThree[0].points}</p>
                  {topThree[0].isCurrentUser && (
                    <span className="bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 ml-1">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3rd Place - Right */}
            <div className="flex flex-col items-center flex-1 max-w-[140px] relative">
              {/* Rank Badge */}
              <div className="absolute -top-2 left-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-20 shadow-sm">
                <span className="text-gray-700 font-bold text-xs">3</span>
              </div>

              {/* Avatar Circle */}
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center border-2 border-white shadow-lg mb-2 z-10 relative">
                <Image
                  src={getAvatarUrl(topThree[2].name)}
                  alt={topThree[2].name}
                  width={72}
                  height={72}
                  sizes="72px"
                  className="rounded-full"
                  unoptimized
                />
              </div>

              {/* Podium Block - Shortest */}
              <div className="bg-[#FCE7F3] rounded-xl w-full h-36 flex flex-col items-center justify-end pb-3 shadow-lg relative">
                <p className="font-bold text-gray-900 text-sm text-center mb-1">{topThree[2].name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <p className="text-gray-700 font-semibold text-sm">{topThree[2].points}</p>
                  {topThree[2].isCurrentUser && (
                    <span className="bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 ml-1">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* If less than 3 students, show them in list format */}
        {topThree.length > 0 && topThree.length < 3 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Students</h2>
            <div className="space-y-2">
              {topThree.map((student) => (
                <StudentRow key={student.studentId} student={student} />
              ))}
            </div>
          </div>
        )}

        {/* Scrollable List Section */}
        {otherStudents.length > 0 && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {otherStudents.map((student) => (
                <StudentRow key={student.studentId} student={student} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// Student row component
function StudentRow({ student }: { student: LeaderboardRanking }) {
  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
        student.isCurrentUser ? "bg-[#F5F0FA] border-2 border-[#9B61FF]" : "bg-[#FDF7FE]"
      }`}
    >
      {/* Rank Badge */}
      <div className="w-8 h-8 rounded-full bg-[#FDF7FE] flex items-center justify-center flex-shrink-0">
        <span className="text-gray-700 font-bold text-sm">{student.rank}</span>
      </div>

      {/* Avatar */}
      <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
        <Image
          src={getAvatarUrl(student.name)}
          alt={student.name}
          width={40}
          height={40}
          sizes="40px"
          className="rounded-full"
          unoptimized
        />
      </div>

      {/* Name */}
      <span className="text-gray-800 font-medium flex-1">
        {student.name}
        {student.isCurrentUser && (
          <span className="ml-2 bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
            You
          </span>
        )}
      </span>

      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-yellow-500 text-lg">
          <Coins size={20} />
        </span>
        <span className="font-bold text-gray-800 w-16 text-right">{student.points}</span>
      </div>
    </div>
  )
}
