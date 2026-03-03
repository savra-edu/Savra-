"use client"
import Image from "next/image"
import Link from "next/link"

interface AssessmentCTAProps {
  className?: string
}

export function AssessmentCTA({ className }: AssessmentCTAProps) {
  const actions = [
      {
        title: "Create Quiz",
        bgColor: "bg-[#FFF9E6]",
        buttonColor: "bg-[#DF6647]",
        image: "/images/question-paper.svg",
        href: "/quiz",
      },
    {
      title: "Create Question Paper",
      bgColor: "bg-[#FFE6F0]",
      buttonColor: "bg-[#DF6647]",
      image: "/images/question-paper-2.svg",
      href: "/assessments/create",
    },
  ]

  return (
    <section className={`mt-2 ${className || ""}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 w-full max-w-full mt-6 lg:mt-12">
        {actions.map((action, index) => (
          <div
            key={index}
            className={`relative ${action.bgColor} border border-[#F0EAFA] rounded-2xl lg:rounded-3xl p-4 lg:p-6 min-h-[180px] lg:min-h-[200px] flex flex-col gap-0 items-center justify-end overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group min-w-0`}
          >
            <div className="flex items-center justify-center w-full mb-2">
              <Image 
                src={action.image} 
                alt={action.title}
                width={240}
                height={200}
                className="object-cover h-32 lg:h-42"
              />
            </div>
            <Link
              href={action.href}
              className={`relative top-0 ${action.buttonColor} text-white font-semibold py-2.5 lg:py-3 px-4 lg:px-6 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap group-hover:bg-[#DF6647]/95 inline-block text-center text-sm lg:text-base w-full`}
            >
              {action.title}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
