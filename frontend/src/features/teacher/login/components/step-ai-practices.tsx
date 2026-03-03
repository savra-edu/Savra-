"use client"

interface StepAIPracticesProps {
  onAccept: () => void
}

export function StepAIPractices({ onAccept }: StepAIPracticesProps) {
  return (
    <div className="space-y-6">
      {/* Top horizontal line */}
      <div className="h-px bg-gray-300 w-full" />
      
      {/* Content */}
      <div className="space-y-4 text-sm text-[#353535] text-left">
        <div>
          <span className="font-semibold text-[#242220]">Check for Bias and Accuracy:</span>{" "}
          <span className="text-[#353535]">
            AI isn't perfect. It might produce biased or incorrect information. Always review before sharing with students.
          </span>
        </div>

        <div>
          <span className="font-semibold text-[#242220]">Use the 80/20 rule:</span>{" "}
          <span className="text-[#353535]">
            Let AI handle the initial 80% as your draft, then add your final touch as the last 20%.
          </span>
        </div>

        <div>
          <span className="font-semibold text-[#242220]">Trust your Judgement:</span>{" "}
          <span className="text-[#353535]">
            Use AI as a starting point, and not the final solution. Always adhere to your school's guidance.
          </span>
        </div>

        <div>
          <span className="font-semibold text-[#242220]">Protect Student Privacy:</span>{" "}
          <span className="text-[#353535]">
            Never include student names or personal information in your prompts. We strive to promptly remove any
            personally identifiable information that is accidentally shared.
          </span>
        </div>
      </div>
    </div>
  )
}
