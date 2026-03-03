import React from "react"

interface StatCardProps {
  label: string
  value?: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  description?: string
}

export function StatCard({ label, value, subtitle, icon, color, description }: StatCardProps) {
  return (
    <div className={`p-6 rounded-lg ${color} border border-border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-foreground text-sm font-medium mb-2">{label}</p>
          {subtitle && <p className="text-foreground">{subtitle}</p>}
          {value !== undefined && (
            <p className="text-4xl font-bold text-foreground mt-2">{value}</p>
          )}
          {description && (
            <p className="text-xs text-foreground mt-2">{description}</p>
          )}
        </div>
        <div className={`text-2xl ${description ? "mt-1" : ""}`}>{icon}</div>
      </div>
    </div>
  )
}
