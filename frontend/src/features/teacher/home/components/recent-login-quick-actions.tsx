"use client"
import Image from "next/image"
import Link from "next/link"

export function RecentLoginQuickActions() {
  const actions = [
      {
        title: "Create a Quiz",
        bgColor: "bg-[#FFECEC]",
        buttonColor: "bg-[#DF6647]",
        image: "/images/question-paper.svg",
        href: "/quiz",
      },
      {
        title: "Create Lesson Plan",
        bgColor: "bg-[#E6FFFE]",
        buttonColor: "bg-[#DF6647]",
        image: "/images/lesson-plan.svg",
        href: "/lesson-plan",
      },
    {
      title: "Create Question Paper",
      bgColor: "bg-[#FFFCE1]",
      buttonColor: "bg-[#DF6647]",
      image: "/images/question-paper-2.svg",
      href: "/assessments/create",
    },
  ]

  return (
    <section className="mt-2">
      <h2 className="text-base font-semibold mb-2 text-[#353535]">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-6 w-full max-w-full mt-12">
        {actions.map((action, index) => (
          <div
            key={index}
            className={`relative ${action.bgColor} border border-[#F0EAFA] rounded-3xl p-6 min-h-[200px] flex flex-col items-center justify-end overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group min-w-0`}
          >
            <div className="flex items-center justify-center w-full">
              <Image 
                src={action.image} 
                alt={action.title}
                width={180}
                height={200}
                className="object-contain h-48"
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
