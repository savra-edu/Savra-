type TabValue = 'week' | 'month' | 'year'

interface TimePeriodTabsProps {
  activeTab: TabValue
  setActiveTab: (tab: TabValue) => void
}

export function TimePeriodTabs({ activeTab, setActiveTab }: TimePeriodTabsProps) {
  const tabs: { key: TabValue; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ]

  return (
    <div className="flex gap-1 bg-white border border-[#E7E1DA] rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
            activeTab === tab.key ? "bg-[#F5ECF5] text-[#353535]" : "text-gray-700 hover:text-gray-900"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
