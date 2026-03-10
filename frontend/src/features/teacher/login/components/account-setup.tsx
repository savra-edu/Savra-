"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingDialog } from "./onboarding-dialog"
import { StepRoleSelect } from "./step-role-select"
import { StepAddSubject } from "./step-add-dialog"
import { StepSubjectSelect } from "./step-subject-select"
import { StepClassSelect } from "./step-class-select"
import { StepNameInput } from "./step-name-input"
import { StepAIPractices } from "./step-ai-practices"
import { api } from "@/lib/api"
import { saveOnboardingData } from "@/lib/onboarding-storage"

export default function AccountSetup() {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(true)
  const [formData, setFormData] = useState({
    role: "",
    subjects: [] as string[],
    classes: [] as string[],
    name: "",
  })
  const [showAddSubjectStep, setShowAddSubjectStep] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [newSubject, setNewSubject] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddSubjectClick = () => {
    setShowAddSubjectStep(true)
    setCurrentStepIndex(2) // addSubject step index (role=0, subjects=1, addSubject=2)
  }

  const handleAddSubjectNext = () => {
    // When user clicks Next on add subject step, add the subject and go back to subjects
    if (newSubject.trim()) {
      const updatedSubjects = [...formData.subjects, newSubject.trim()]
      setFormData({ ...formData, subjects: updatedSubjects })
    }
    setNewSubject("")
    setCurrentStepIndex(1) // Back to subjects step
    setShowAddSubjectStep(false)
  }

  const handleAddSubjectBack = () => {
    setNewSubject("")
    setCurrentStepIndex(1) // Back to subjects step
    setShowAddSubjectStep(false)
  }

  const baseSteps = [
    {
      id: "role",
      title: "What's your role?",
      description: "We have tools to save time for every role. Help us help you!",
      content: <StepRoleSelect value={formData.role} onSelect={(role) => setFormData({ ...formData, role })} />,
    },
    {
      id: "subjects",
      title: "What subject(s) do you teach?",
      description: "We'll recommend the tools that are most popular for your key subjects.",
      content: (
        <StepSubjectSelect
          value={formData.subjects}
          onSelect={(subjects) => setFormData({ ...formData, subjects })}
          onAddSubjectClick={handleAddSubjectClick}
        />
      ),
      showSkip: true,
    },
    {
      id: "classes",
      title: "Which classes do you teach?",
      description: "Select all the classes you teach to help us personalize your experience.",
      content: (
        <StepClassSelect
          value={formData.classes}
          onSelect={(classes) => setFormData({ ...formData, classes })}
        />
      ),
      showSkip: true,
    },
    {
      id: "name",
      title: "How would you like to be addressed?",
      description: "You're almost done! Help us customize engagement with your students.",
      content: <StepNameInput value={formData.name} onInput={(name) => setFormData({ ...formData, name })} />,
      showSkip: true,
    },
    {
      id: "aiPractices",
      title: "Best practices for using AI",
      description: "",
      content: <StepAIPractices onAccept={() => handleComplete()} />,
      showSkip: false,
      onNext: () => handleComplete(),
    },
  ]

  // Insert add subject step dynamically when needed
  const steps = showAddSubjectStep
    ? [
        ...baseSteps.slice(0, 2),
        {
          id: "addSubject",
          title: "Add Subject",
          description: "",
          content: <StepAddSubject value={newSubject} onInput={(value) => setNewSubject(value)} />,
          showSkip: true,
          onNext: handleAddSubjectNext,
          onBack: handleAddSubjectBack,
        },
        ...baseSteps.slice(2),
      ]
    : baseSteps

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)

    // Store onboarding data in localStorage for preview (always save)
    saveOnboardingData({
      role: formData.role,
      school: "",
      subjects: formData.subjects,
      classes: formData.classes,
      name: formData.name,
      completedAt: new Date().toISOString(),
    })

    try {
      await api.post("/teacher/onboarding", {
        role: formData.role,
        subjects: formData.subjects,
        classes: formData.classes,
        name: formData.name,
      })

      // Navigate to home on success
      router.push("/home")
    } catch (err) {
      // If API fails, still navigate (graceful degradation)
      console.error("Onboarding submission failed:", err)
      // Still navigate to home - the data is stored locally
      router.push("/home")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't return null - let the route change handle component lifecycle
  // Returning null here causes rendering issues when navigation happens

  return (
    <main className="min-h-screen bg-gray-100 md:p-4">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg z-50">
          {error}
        </div>
      )}
      <OnboardingDialog
        steps={steps}
        onComplete={handleComplete}
        onClose={() => setShowDialog(false)}
        initialStep={currentStepIndex}
      />
    </main>
  )
}
