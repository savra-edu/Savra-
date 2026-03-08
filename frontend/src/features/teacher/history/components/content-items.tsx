import Link from "next/link"

interface ContentItemProps {
  title: string
  subtitle: string
  badge: {
    label: string
    color: "pink" | "blue" | "orange"
  }
  date: string
  time: string
  href?: string
}

const badgeColors = {
  pink: "bg-[#FCDAE4] text-[#353535]",
  blue: "bg-[#E0E7FC] text-[#353535]",
  orange: "bg-[#FEEBD4] text-[#353535]",
}

export function ContentItem({ title, subtitle, badge, date, time, href }: ContentItemProps) {
  const content = (
    <>
      <div className="flex-1 min-w-0">
        <h3 className="text-base lg:text-lg font-bold text-[#353535] mb-1 lg:mb-2">{title}</h3>
        <p className="text-xs lg:text-sm text-[#353535]">{subtitle}</p>
      </div>

      <div className="flex flex-col items-end gap-2 ml-4 shrink-0">
        <p className="text-xs lg:text-sm text-gray-500 whitespace-nowrap">{date}, {time}</p>
        <div className={`px-2 lg:px-3 py-1 rounded-md text-xs font-normal whitespace-nowrap ${badgeColors[badge.color]}`}>
          {badge.label}
        </div>
      </div>
    </>
  )

  const baseClasses = "border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-6 flex items-start justify-between bg-white lg:bg-[#FCF8FE] transition"

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} hover:bg-gray-50 lg:hover:bg-[#F5EFFE] cursor-pointer block`}
      >
        {content}
      </Link>
    )
  }

  return <div className={baseClasses}>{content}</div>
}
