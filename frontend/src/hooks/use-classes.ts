import { useCachedTeacherClasses, useCachedSchoolClasses } from "@/contexts/data-context"

// Re-export types for backward compatibility
export interface Class {
  id: string
  name: string
  grade: number
  section: string
  studentCount?: number
}

// Returns teacher's assigned classes (for dropdowns/filtering)
// Uses cached data from DataProvider - no duplicate API calls!
export function useTeacherClasses() {
  return useCachedTeacherClasses()
}

// Returns ALL classes from teacher's school (for profile editing)
// Uses cached data from DataProvider - no duplicate API calls!
export function useSchoolClasses() {
  return useCachedSchoolClasses()
}
