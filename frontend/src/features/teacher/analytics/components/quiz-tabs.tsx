"use client"

interface QuizTabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function QuizTabs({ tabs, activeTab, onTabChange }: QuizTabsProps) {
  return (
    <div className="flex gap-3">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
            activeTab === tab
              ? "bg-purple-100 border-purple-300 text-purple-900"
              : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
