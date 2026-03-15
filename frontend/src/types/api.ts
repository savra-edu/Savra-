// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'admin';
  avatarUrl?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Present when user comes from /auth/me - indicates OAuth vs password auth */
  authMethod?: 'password' | 'google';
}

export interface TeacherProfile extends User {
  teacher: {
    id: string;
    schoolId: string;
    location?: string;
    school: { id: string; name: string; code: string };
    subjects: Array<{ id: string; name: string; code: string }>;
    classes: Array<{ id: string; name: string; grade: number; section: string }>;
  };
}

export interface StudentProfile extends User {
  student: {
    id: string;
    classId: string;
    rollNumber?: string;
    totalPoints: number;
    class: { id: string; name: string; grade: number; section: string };
  };
}

export interface AdminProfile extends User {
  admin: {
    id: string;
    schoolId: string;
    school: { id: string; name: string; code: string };
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// Pagination
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common entity types
export interface School {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Class {
  id: string;
  schoolId: string;
  grade: number;
  section: string;
  name: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
}

// Lesson types
export interface LessonPeriod {
  id: string;
  lessonId: string;
  periodNo: number;
  concept?: string;
  learningOutcomes?: string;
  teacherLearningProcess?: string;
  assessment?: string;
  resources?: string;
  centurySkillsValueEducation?: string;
  realLifeApplication?: string;
  reflection?: string;
}

export interface Lesson {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  title: string;
  objective?: string;
  duration?: number;
  status: 'draft' | 'saved' | 'published';
  content?: string;
  referenceFileUrl?: string;
  startDate?: string;
  endDate?: string;
  topic?: string;
  numberOfPeriods?: number;
  hiddenColumns?: string[];
  createdAt: string;
  updatedAt: string;
  class?: Class;
  subject?: Subject;
  chapters?: Chapter[];
  periods?: LessonPeriod[];
}

// Quiz types
export interface Quiz {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  title: string;
  objective?: string;
  timeLimit?: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  totalMarks: number;
  status: 'draft' | 'saved' | 'published';
  dueDate?: string;
  isOptional: boolean;
  referenceFileUrl?: string;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  subject?: Subject;
  chapters?: Chapter[];
  questions?: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'mcq' | 'short_answer' | 'long_answer' | 'case_study';
  marks: number;
  orderIndex: number;
  createdAt: string;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
}

// Quiz attempt types
export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  timeTaken?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  startedAt: string;
  submittedAt?: string;
  quiz?: Quiz;
  answers?: StudentAnswer[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string;
  answerText?: string;
  isCorrect?: boolean;
  marksObtained: number;
}

// Assessment types
export interface Assessment {
  id: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  title: string;
  objective?: string;
  totalMarks: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'saved' | 'published';
  referenceBooks: string[];
  referenceFileUrl?: string;
  questionPaper?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  class?: Class;
  subject?: Subject;
  chapters?: Chapter[];
}

export type GenerationArtifactType = 'lesson' | 'quiz' | 'assessment';
export type GenerationJobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type GenerationJobStage =
  | 'queued'
  | 'preparing'
  | 'generating'
  | 'saving'
  | 'completed'
  | 'failed';

export interface GenerationJob {
  id: string;
  teacherId: string;
  artifactType: GenerationArtifactType;
  artifactId: string;
  status: GenerationJobStatus;
  stage: GenerationJobStage;
  progress: number;
  errorMessage?: string | null;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Announcement types
export interface Announcement {
  id: string;
  teacherId: string;
  classId: string;
  title: string;
  content: string;
  attachmentUrl?: string;
  createdAt: string;
  class?: Class;
  isRead?: boolean;
}

// Dashboard types
export interface TeacherDashboardStats {
  lessonCount: number;
  quizCount: number;
  assessmentCount: number;
  announcementCount: number;
  studentCount: number;
  classCount: number;
}

export interface TeacherDashboardRecent {
  recentLessons: Lesson[];
  recentQuizzes: Quiz[];
  recentAttempts: QuizAttempt[];
}

export interface StudentPerformance {
  student: {
    name: string;
    class: string;
    totalPoints: number;
  };
  quizStats: {
    total: number;
    completed: number;
    averageScore: number;
  };
  recentAttempts: QuizAttempt[];
  subjectBreakdown: Array<{
    subject: string;
    attempts: number;
    avgScore: number;
  }>;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  points: number;
  isCurrentUser: boolean;
}

export interface AdminDashboardStats {
  teacherCount: number;
  studentCount: number;
  classCount: number;
  lessonCount: number;
  quizCount: number;
  assessmentCount: number;
}
