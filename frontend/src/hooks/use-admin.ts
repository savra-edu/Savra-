'use client';

import { useFetch, usePaginated } from './use-api';

// ============ Types ============

export interface AdminDashboardStats {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalLessons: number;
  totalAssessments: number;
  totalQuizzes: number;
  submissionRate: number;
  studentsPerClass: Array<{
    id: string;
    name: string;
    grade: number;
    section: string;
    studentCount: number;
  }>;
  teacherWorkload: Array<{
    id: string;
    name: string;
    classCount: number;
    subjectCount: number;
  }>;
}

export interface AdminTeacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  location?: string;
  subjects: Array<{ id: string; name: string }>;
  classes: Array<{ id: string; name: string; grade: number; section: string }>;
  lessonCount: number;
  quizCount: number;
  assessmentCount: number;
  createdAt: string;
}

export interface AdminStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  rollNumber?: string;
  class?: { id: string; name: string; grade: number; section: string };
  createdAt: string;
}

/** Extended student detail from GET /admin/students/:id (includes quiz analytics) */
export interface AdminStudentDetail extends AdminStudent {
  totalPoints?: number;
  quizPerformance?: {
    totalAttempts: number;
    averageScore: number;
    recentAttempts: Array<{
      id: string;
      quizTitle: string;
      score: number | null;
      totalMarks: number | null;
      submittedAt: string | null;
    }>;
  };
}

export interface AdminClassStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  rollNumber?: string | null;
  totalPoints?: number;
}

export interface AdminClass {
  id: string;
  name: string;
  grade: number;
  section: string;
  studentCount: number;
  teacherCount: number;
  averageScore?: number;
  students?: AdminClassStudent[];
  teachers?: Array<{ id: string; name: string; email: string }>;
  createdAt: string;
}

export interface TeacherInsights {
  teacher: AdminTeacher;
  contentStats: {
    lessons: { total: number; byStatus: { draft: number; published: number } };
    quizzes: { total: number; byStatus: { draft: number; published: number } };
    assessments: number;
    announcements: number;
  };
  recentActivity: {
    lessons: Array<{ id: string; title: string; status: string; createdAt: string }>;
    quizzes: Array<{ id: string; title: string; status: string; createdAt: string }>;
  };
  studentEngagement: {
    totalStudents: number;
    totalQuizAttempts: number;
    averageScore: number;
  };
}

export interface ClassPerformance {
  class: { id: string; name: string; grade: number; section: string };
  studentCount: number;
  averageScore: number;
  participationRate: number;
  totalQuizAttempts: number;
  topPerformers: Array<{ studentId: string; name: string; average: number; attempts: number }>;
  needsAttention: Array<{ studentId: string; name: string; average: number; attempts: number }>;
  subjectBreakdown: Array<{ subjectId: string; subjectName: string; averageScore: number }>;
  monthlyAverages?: Array<{ month: string; value: number }>;
  weeklyParticipation?: Array<{ day: string; value: number }>;
}

export interface AdminSchool {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  adminId: string;
}

// ============ Hooks ============

/**
 * Fetch admin dashboard stats
 */
export function useAdminDashboard() {
  return useFetch<AdminDashboardStats>('/admin/dashboard/stats');
}

/**
 * Activity data for dashboard chart
 */
export interface ActivityData {
  day: string;
  lessons: number;
  quizzes: number;
  assessments: number;
}

/**
 * Fetch dashboard activity data by time period
 */
export function useAdminActivityData(period: 'week' | 'month' | 'year') {
  return useFetch<ActivityData[]>(`/admin/dashboard/activity?period=${period}`);
}

/**
 * Fetch paginated list of teachers
 */
export function useAdminTeachers(page = 1, limit = 20) {
  return usePaginated<AdminTeacher>('/admin/teachers', page, limit);
}

/**
 * Fetch a single teacher by ID
 */
export function useAdminTeacher(id: string | null) {
  return useFetch<AdminTeacher>(id ? `/admin/teachers/${id}` : null);
}

/**
 * Fetch teacher insights (content stats, engagement, etc.)
 */
export function useTeacherInsights(id: string | null) {
  return useFetch<TeacherInsights>(id ? `/admin/teachers/${id}/insights` : null);
}

/**
 * Fetch paginated list of students
 */
export function useAdminStudents(page = 1, limit = 20, classId?: string) {
  const params = classId ? `?classId=${classId}` : '';
  return usePaginated<AdminStudent>(`/admin/students${params}`, page, limit);
}

/**
 * Fetch a single student by ID (includes quiz performance)
 */
export function useAdminStudent(id: string | null) {
  return useFetch<AdminStudentDetail>(id ? `/admin/students/${id}` : null);
}

/**
 * Fetch paginated list of classes
 */
export function useAdminClasses(page = 1, limit = 20, grade?: number) {
  const params = grade ? `?grade=${grade}` : '';
  return usePaginated<AdminClass>(`/admin/classes${params}`, page, limit);
}

/**
 * Fetch a single class by ID
 */
export function useAdminClass(id: string | null) {
  return useFetch<AdminClass>(id ? `/admin/classes/${id}` : null);
}

/**
 * Fetch class performance data
 */
export function useClassPerformance(id: string | null) {
  return useFetch<ClassPerformance>(id ? `/admin/classes/${id}/performance` : null);
}

/**
 * Fetch school details
 */
export function useAdminSchool() {
  return useFetch<AdminSchool>('/admin/school');
}
