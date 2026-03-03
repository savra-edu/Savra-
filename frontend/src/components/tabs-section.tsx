"use client"

interface TabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex items-center gap-4 lg:gap-8 border-b border-gray-200 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`py-3 lg:py-4 px-1 font-medium transition whitespace-nowrap ${
            activeTab === tab 
              ? "text-black border-b-2 border-gray-900 font-bold" 
              : "text-[#353535] hover:text-gray-900"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
