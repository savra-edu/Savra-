"use client"

import { type ReactNode, useState, useEffect } from "react"
import { ChevronLeft, X } from "lucide-react"
import Image from "next/image"

interface OnboardingStep {
  id: string
  title: string
  description: string
  content: ReactNode
  showSkip?: boolean
  isCompleted?: boolean
  buttonLabel?: string
  onNext?: () => void
  onBack?: () => void
}

interface OnboardingDialogProps {
  steps: OnboardingStep[]
  onComplete: (stepId: string) => void
  onClose: () => void
  initialStep?: number
}

export function OnboardingDialog({ steps, onComplete, onClose, initialStep = 0 }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])

  const handleNext = () => {
    if (step.onNext) {
      step.onNext()
      return
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(steps[currentStep].id)
    }
  }

  const handleBack = () => {
    if (step.onBack) {
      step.onBack()
      return
    }
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(steps[currentStep].id)
    }
  }

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isLastStep = currentStep === steps.length - 1

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="pt-4 px-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <div className="flex-1 flex justify-center">
              <Image
                src="/images/savra-logo.png"
                alt="SAVRA Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
          <p className="text-center text-[#353535] text-sm mb-3">Just a few details to get started.</p>
          
          {/* Progress bar */}
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#DF6647] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-[#242220]">{step.title}</h2>
            {step.description && <p className="text-[#353535] text-sm mb-6">{step.description}</p>}
            <div className="mt-6">{step.content}</div>
          </div>
        </div>

        {/* Footer with Next button */}
        <div className="px-4 pb-6 pt-4 border-t border-gray-200">
          <div className="max-w-md mx-auto">
            {isLastStep ? (
              <button
                onClick={handleNext}
                className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                I Accept
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-[#DF6647] hover:bg-[#DF6647]/90 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex fixed inset-0 items-center justify-center bg-black/50 z-50">
        <div className="relative w-full max-w-2xl mx-4 rounded-lg bg-white p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-[#8C8C8C]" />
              </button>
              <div className="flex justify-center">
                <Image
                  src="/images/savra-logo.png"
                  alt="SAVRA Logo"
                  width={180}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6 text-[#8C8C8C]" />
              </button>
            </div>
            <p className="text-center text-[#353535] text-sm -mt-12 mb-2">Just a few details to get started.</p>
            <div className="h-px bg-gray-200" />
          </div>

          {/* Content */}
          <div className="min-h-[300px] flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-center mb-2 text-[#242220]">{step.title}</h2>
              {step.description && <p className="text-center text-[#353535] text-sm mb-6">{step.description}</p>}
              <div className="mt-6">{step.content}</div>
            </div>

            {/* Footer with buttons */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex gap-3 justify-center">
                {isLastStep ? (
                  // Last step - show Back and I Accept buttons
                  <>
                    <button
                      onClick={handleBack}
                      className="px-6 py-2 border-2 border-[#DF6647] text-[#DF6647] bg-white rounded-lg hover:bg-[#DF6647]/5 font-medium transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-[#DF6647] hover:bg-[#DF6647]/90 text-white rounded-lg font-medium transition-colors"
                    >
                      I Accept
                    </button>
                  </>
                ) : (
                  <>
                    {step.showSkip && (
                      <button
                        onClick={handleSkip}
                        className="px-6 py-2 border-2 border-[#DF6647] text-[#DF6647] rounded-lg hover:bg-[#DF6647]/5 bg-transparent font-medium transition-colors"
                      >
                        Skip
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="px-6 py-2 bg-[#DF6647] hover:bg-[#DF6647]/90 text-white rounded-lg font-medium transition-colors"
                    >
                      Next
                    </button>
                  </>
                )}
              </div>
              <p className="text-center text-[#8C8C8C] text-sm">
                Step {currentStep + 1}/{steps.length}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-[#DF6647] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  )
}
