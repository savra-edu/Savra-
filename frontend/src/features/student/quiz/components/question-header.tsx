interface QuestionHeaderProps {
    currentQuestion: number
    totalQuestions: number
  }
  
  export function QuestionHeader({ currentQuestion, totalQuestions }: QuestionHeaderProps) {
    return (
      <div className="mb-6 hidden lg:block">
        <h1 className="text-lg font-medium text-[#353535] mb-3">
          Question {currentQuestion} of {totalQuestions}
        </h1>
      </div>
    )
  }
  