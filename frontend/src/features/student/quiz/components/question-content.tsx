interface QuestionContentProps {
    label: string
    text: string
  }
  
  export function QuestionContent({ label, text }: QuestionContentProps) {
    return (
      <div>
        <div className="hidden lg:inline-block bg-[#EFE5FC] text-[#816D9E] px-4 py-2 rounded-lg mb-6 font-semibold">{label}</div>
        <h2 className="text-lg lg:text-xl font-bold lg:font-semibold text-gray-900 lg:text-gray-800">{text}</h2>
      </div>
    )
  }
  