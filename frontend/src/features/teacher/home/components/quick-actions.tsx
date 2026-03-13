"use client"
import Image from "next/image"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Create lesson plan",
      bgColor: "bg-[#FFFCE1]",
      buttonColor: "bg-[#DF6647]",
      image: "/images/lesson-plan.svg",
      href: "/lesson-plan",
    },
    {
      title: "Create Assessment",
      bgColor: "bg-[#FFECEC]",
      buttonColor: "bg-[#DF6647]",
      image: "/images/question-paper.svg",
      href: "/assessments",
    },
    {
      title: "Analytics",
      bgColor: "bg-[#E6FFFE]",
      buttonColor: "bg-[#DF6647]",
      image: "/images/analytics.svg",
      href: "/analytics",
    },
    {
      title: "Announcements",
      bgColor: "bg-[#E7EBFF]",
      buttonColor: "bg-[#DF6647]",
      image: "/images/announcements.svg",
      href: "/announcements",
    },
  ]

  return (
    <section className="mt-4 flex-shrink-0">
      <h2 className="text-base font-semibold mb-2 text-[#353535]">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4 w-full max-w-full">
        {actions.map((action, index) => (
          <div
            key={index}
            className={`relative ${action.bgColor} border border-[#F0EAFA] rounded-3xl p-4 min-h-[160px] flex flex-col items-center justify-end overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group min-w-0`}
          >
            <div className="flex items-center justify-center w-full">
              <Image 
                src={action.image} 
                alt={action.title}
                width={180}
                height={200}
                sizes="(max-width: 768px) 50vw, 180px"
                className="object-contain h-34"
              />
            </div>
            <Link
              href={action.href}
              className={`relative z-10 ${action.buttonColor} text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap group-hover:bg-[#DF6647]/95 inline-block text-center`}
            >
              {action.title}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
