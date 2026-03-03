// Admin Dashboard Constants
// Centralized thresholds for business logic across the admin dashboard

// Performance level thresholds for student/topic performance charts
export const PERFORMANCE_THRESHOLDS = {
  ABOVE_TARGET: 80,    // >= 80% is "above target"
  ON_TRACK: 60,        // >= 60% is "on track"
  BELOW_TARGET: 40,    // >= 40% is "below target"
  // < 40% is "critical"
} as const

// Teacher activity level thresholds based on total content created
export const ACTIVITY_THRESHOLDS = {
  HIGH: 30,    // >= 30 total content items (lessons + quizzes + assessments)
  MEDIUM: 15,  // >= 15 total content items
  // < 15 is "Low"
} as const

// Class size thresholds for alerts
export const CLASS_SIZE_THRESHOLDS = {
  LOW_ENROLLMENT_WARNING: 20,  // Classes with < 20 students trigger enrollment review alert
} as const

// Student engagement thresholds
export const ENGAGEMENT_THRESHOLDS = {
  LOW_SCORE_WARNING: 60,  // < 60% average score triggers "low engagement" warning
} as const

// Helper function to get performance status based on percentage
export function getPerformanceStatus(percentage: number): 'above' | 'on-track' | 'below' | 'critical' {
  if (percentage >= PERFORMANCE_THRESHOLDS.ABOVE_TARGET) return 'above'
  if (percentage >= PERFORMANCE_THRESHOLDS.ON_TRACK) return 'on-track'
  if (percentage >= PERFORMANCE_THRESHOLDS.BELOW_TARGET) return 'below'
  return 'critical'
}

// Helper function to get teacher activity level based on total content created
export function getActivityLevel(totalContent: number): 'High' | 'Mid' | 'Low' {
  if (totalContent >= ACTIVITY_THRESHOLDS.HIGH) return 'High'
  if (totalContent >= ACTIVITY_THRESHOLDS.MEDIUM) return 'Mid'
  return 'Low'
}

// Performance status labels with thresholds for display
export const PERFORMANCE_LABELS = {
  above: `Above Target (${PERFORMANCE_THRESHOLDS.ABOVE_TARGET}%+)`,
  'on-track': `On Track (${PERFORMANCE_THRESHOLDS.ON_TRACK}-${PERFORMANCE_THRESHOLDS.ABOVE_TARGET - 1}%)`,
  below: `Below Target (${PERFORMANCE_THRESHOLDS.BELOW_TARGET}-${PERFORMANCE_THRESHOLDS.ON_TRACK - 1}%)`,
  critical: `Critical (<${PERFORMANCE_THRESHOLDS.BELOW_TARGET}%)`,
} as const
