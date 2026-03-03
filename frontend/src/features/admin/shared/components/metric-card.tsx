import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string | number
  icon: any
  trend?: number
  color: string
}

export function MetricCard({ label, value, icon, trend, color }: MetricCardProps) {
  return (
    <div className={`${color} rounded-2xl p-6 flex flex-col justify-between h-full`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[#353535] text-sm mb-2">{label}</p>
            <p className="text-3xl font-medium text-[#353535">{value}</p>
          </div>
          <div className="text-2xl text-[#BDB8BE]">{icon}</div>
        </div>
        <p className="text-xs text-[#353535] mb-3">This week</p>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trend > 0 ? (
            <>
              <TrendingUp className="w-4 h-4 text-[#63A17F]" />
              <span className="text-[#63A17F] text-base font-medium">+{trend}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-[#E09184]" />
              <span className="text-[#E09184] text-base font-medium">{trend}%</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
