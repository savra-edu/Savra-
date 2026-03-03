import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TaskCardProps {
  badge: string
  badgeColor: string
  title: string
  subtitle: string
  buttonText: string
  cardBg: string
  badgeBg: string
  disabled?: boolean
  href?: string
}

export function TaskCard({ badge, badgeColor, title, subtitle, buttonText, cardBg, badgeBg, disabled = false, href }: TaskCardProps) {
  const buttonContent = (
    <Button 
      disabled={disabled}
      className={disabled 
        ? "bg-gray-300 hover:bg-gray-300 text-gray-500 font-semibold py-2 rounded mt-auto w-full cursor-not-allowed" 
        : "bg-[#DF6647] hover:bg-[#DF6647]/80 text-white font-semibold py-2 rounded mt-auto w-full"
      }
    >
      {buttonText}
    </Button>
  )

  return (
    <div className={`${cardBg} rounded-lg flex flex-col overflow-hidden`}>
        <div className={`${badgeBg} w-full rounded-t-lg`}>
            <span className={`${badgeColor} text-gray-800 text-sm font-semibold px-3 py-2 inline-block rounded`}>{badge}</span>
        </div>
      <div className="flex flex-col items-start justify-center p-4 pb-6 flex-1">
        <h3 className="text-gray-900 font-bold text-lg mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{subtitle}</p>
        {href && !disabled ? (
          <Link href={href} className="w-full">
            {buttonContent}
          </Link>
        ) : (
          buttonContent
        )}
      </div>
    </div>
  )
}
