// Utility functions to store and retrieve onboarding data from localStorage

export interface OnboardingData {
  role: string
  school: string
  subjects: string[]
  classes: string[]
  name: string
  completedAt: string
}

export const saveOnboardingData = (data: OnboardingData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('teacherOnboarding', JSON.stringify(data))
  }
}

export const getOnboardingData = (): OnboardingData | null => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('teacherOnboarding')
    if (data) {
      try {
        return JSON.parse(data) as OnboardingData
      } catch {
        return null
      }
    }
  }
  return null
}

export const getSelectedSubjects = (): string[] => {
  const data = getOnboardingData()
  return data?.subjects || []
}

export const getSelectedClasses = (): string[] => {
  const data = getOnboardingData()
  return data?.classes || []
}

export const clearOnboardingData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('teacherOnboarding')
  }
}
