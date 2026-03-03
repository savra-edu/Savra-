'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { useAuth } from './auth-context';

// Types
interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface TeacherSubject {
  id: string;
  name: string;
  lessonCount?: number;
  quizCount?: number;
}

interface Class {
  id: string;
  name: string;
  grade: number;
  section: string;
  studentCount?: number;
}

interface StudentClass {
  id: string;
  name: string;
  grade: number | string;
  section?: string;
  school?: { id: string; name: string };
}

interface StudentSubject {
  id: string;
  name: string;
}

interface DataContextType {
  // Teacher data
  teacherSubjects: TeacherSubject[] | null;
  teacherClasses: Class[] | null;
  allSubjects: Subject[] | null;
  schoolClasses: Class[] | null;

  // Student data
  studentClass: StudentClass | null;
  studentSubjects: StudentSubject[] | null;

  // Loading states
  isLoadingTeacherData: boolean;
  isLoadingAllSubjects: boolean;
  isLoadingSchoolClasses: boolean;
  isLoadingStudentData: boolean;

  // Error states
  teacherDataError: string | null;
  allSubjectsError: string | null;
  schoolClassesError: string | null;
  studentDataError: string | null;

  // Refetch functions
  refetchTeacherData: () => Promise<void>;
  refetchAllSubjects: () => Promise<void>;
  refetchSchoolClasses: () => Promise<void>;
  refetchStudentData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Teacher-specific data (subjects and classes assigned to them)
  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubject[] | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<Class[] | null>(null);
  const [isLoadingTeacherData, setIsLoadingTeacherData] = useState(false);
  const [teacherDataError, setTeacherDataError] = useState<string | null>(null);
  const [teacherDataFetched, setTeacherDataFetched] = useState(false);

  // All subjects (for profile editing)
  const [allSubjects, setAllSubjects] = useState<Subject[] | null>(null);
  const [isLoadingAllSubjects, setIsLoadingAllSubjects] = useState(false);
  const [allSubjectsError, setAllSubjectsError] = useState<string | null>(null);
  const [allSubjectsFetched, setAllSubjectsFetched] = useState(false);

  // All school classes (for profile editing)
  const [schoolClasses, setSchoolClasses] = useState<Class[] | null>(null);
  const [isLoadingSchoolClasses, setIsLoadingSchoolClasses] = useState(false);
  const [schoolClassesError, setSchoolClassesError] = useState<string | null>(null);
  const [schoolClassesFetched, setSchoolClassesFetched] = useState(false);

  // Student-specific data (class and subjects)
  const [studentClass, setStudentClass] = useState<StudentClass | null>(null);
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[] | null>(null);
  const [isLoadingStudentData, setIsLoadingStudentData] = useState(false);
  const [studentDataError, setStudentDataError] = useState<string | null>(null);
  const [studentDataFetched, setStudentDataFetched] = useState(false);

  // Fetch teacher's assigned subjects and classes
  const fetchTeacherData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'teacher') return;

    setIsLoadingTeacherData(true);
    setTeacherDataError(null);

    try {
      // Fetch both in parallel
      const [subjectsRes, classesRes] = await Promise.all([
        api.get<{ success: boolean; data: { subjects: TeacherSubject[] } }>('/teacher/subjects'),
        api.get<{ success: boolean; data: { classes: Class[] } }>('/teacher/classes'),
      ]);

      setTeacherSubjects(subjectsRes.data.subjects);
      setTeacherClasses(classesRes.data.classes);
      setTeacherDataFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch teacher data';
      setTeacherDataError(message);
    } finally {
      setIsLoadingTeacherData(false);
    }
  }, [isAuthenticated, user?.role]);

  // Fetch all subjects
  const fetchAllSubjects = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingAllSubjects(true);
    setAllSubjectsError(null);

    try {
      const response = await api.get<{ success: boolean; data: Subject[] }>('/subjects');
      setAllSubjects(response.data);
      setAllSubjectsFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subjects';
      setAllSubjectsError(message);
    } finally {
      setIsLoadingAllSubjects(false);
    }
  }, [isAuthenticated]);

  // Fetch all school classes
  const fetchSchoolClasses = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'teacher') return;

    setIsLoadingSchoolClasses(true);
    setSchoolClassesError(null);

    try {
      const response = await api.get<{ success: boolean; data: { classes: Class[] } }>('/teacher/school-classes');
      setSchoolClasses(response.data.classes);
      setSchoolClassesFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch school classes';
      setSchoolClassesError(message);
    } finally {
      setIsLoadingSchoolClasses(false);
    }
  }, [isAuthenticated, user?.role]);

  // Fetch student's class and selected subjects
  const fetchStudentData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'student') return;

    setIsLoadingStudentData(true);
    setStudentDataError(null);

    try {
      // Profile now returns class and subjects
      const profileRes = await api.get<{
        success: boolean;
        data: {
          class?: StudentClass;
          subjects?: StudentSubject[];
        }
      }>('/profile');

      // Extract class and subjects from profile response
      const classData = profileRes.data?.class || null;
      const subjectsData = profileRes.data?.subjects || [];

      setStudentClass(classData);
      setStudentSubjects(subjectsData);
      setStudentDataFetched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch student data';
      setStudentDataError(message);
    } finally {
      setIsLoadingStudentData(false);
    }
  }, [isAuthenticated, user?.role]);

  // Auto-fetch teacher data when user is authenticated as teacher
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'teacher' && !teacherDataFetched && !isLoadingTeacherData) {
      fetchTeacherData();
    }
  }, [authLoading, isAuthenticated, user?.role, teacherDataFetched, isLoadingTeacherData, fetchTeacherData]);

  // Auto-fetch student data when user is authenticated as student
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'student' && !studentDataFetched && !isLoadingStudentData) {
      fetchStudentData();
    }
  }, [authLoading, isAuthenticated, user?.role, studentDataFetched, isLoadingStudentData, fetchStudentData]);

  // Reset data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setTeacherSubjects(null);
      setTeacherClasses(null);
      setAllSubjects(null);
      setSchoolClasses(null);
      setStudentClass(null);
      setStudentSubjects(null);
      setTeacherDataFetched(false);
      setAllSubjectsFetched(false);
      setSchoolClassesFetched(false);
      setStudentDataFetched(false);
    }
  }, [isAuthenticated]);

  // Refetch functions (for manual refresh)
  const refetchTeacherData = useCallback(async () => {
    setTeacherDataFetched(false);
    await fetchTeacherData();
  }, [fetchTeacherData]);

  const refetchAllSubjects = useCallback(async () => {
    setAllSubjectsFetched(false);
    await fetchAllSubjects();
  }, [fetchAllSubjects]);

  const refetchSchoolClasses = useCallback(async () => {
    setSchoolClassesFetched(false);
    await fetchSchoolClasses();
  }, [fetchSchoolClasses]);

  const refetchStudentData = useCallback(async () => {
    setStudentDataFetched(false);
    await fetchStudentData();
  }, [fetchStudentData]);

  return (
    <DataContext.Provider
      value={{
        teacherSubjects,
        teacherClasses,
        allSubjects,
        schoolClasses,
        studentClass,
        studentSubjects,
        isLoadingTeacherData,
        isLoadingAllSubjects,
        isLoadingSchoolClasses,
        isLoadingStudentData,
        teacherDataError,
        allSubjectsError,
        schoolClassesError,
        studentDataError,
        refetchTeacherData,
        refetchAllSubjects,
        refetchSchoolClasses,
        refetchStudentData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

// Convenience hooks that mirror the old API
export function useCachedTeacherSubjects() {
  const { teacherSubjects, isLoadingTeacherData, teacherDataError, refetchTeacherData } = useData();
  return {
    data: teacherSubjects,
    isLoading: isLoadingTeacherData,
    error: teacherDataError,
    refetch: refetchTeacherData,
  };
}

export function useCachedTeacherSubjectNames() {
  const { teacherSubjects, isLoadingTeacherData, teacherDataError, refetchTeacherData } = useData();
  return {
    data: teacherSubjects?.map(s => s.name) || null,
    isLoading: isLoadingTeacherData,
    error: teacherDataError,
    refetch: refetchTeacherData,
  };
}

export function useCachedTeacherClasses() {
  const { teacherClasses, isLoadingTeacherData, teacherDataError, refetchTeacherData } = useData();
  return {
    data: teacherClasses,
    isLoading: isLoadingTeacherData,
    error: teacherDataError,
    refetch: refetchTeacherData,
  };
}

export function useCachedAllSubjects() {
  const context = useData();
  const { allSubjects, isLoadingAllSubjects, allSubjectsError, refetchAllSubjects } = context;

  // Lazy load all subjects only when this hook is used
  useEffect(() => {
    if (!allSubjects && !isLoadingAllSubjects && !allSubjectsError) {
      refetchAllSubjects();
    }
  }, [allSubjects, isLoadingAllSubjects, allSubjectsError, refetchAllSubjects]);

  return {
    data: allSubjects,
    isLoading: isLoadingAllSubjects,
    error: allSubjectsError,
    refetch: refetchAllSubjects,
  };
}

export function useCachedAllSubjectNames() {
  const { data, isLoading, error, refetch } = useCachedAllSubjects();
  return {
    data: data?.map(s => s.name) || null,
    isLoading,
    error,
    refetch,
  };
}

export function useCachedSchoolClasses() {
  const context = useData();
  const { schoolClasses, isLoadingSchoolClasses, schoolClassesError, refetchSchoolClasses } = context;

  // Lazy load school classes only when this hook is used
  useEffect(() => {
    if (!schoolClasses && !isLoadingSchoolClasses && !schoolClassesError) {
      refetchSchoolClasses();
    }
  }, [schoolClasses, isLoadingSchoolClasses, schoolClassesError, refetchSchoolClasses]);

  return {
    data: schoolClasses,
    isLoading: isLoadingSchoolClasses,
    error: schoolClassesError,
    refetch: refetchSchoolClasses,
  };
}

// Student convenience hooks
export function useCachedStudentClass() {
  const { studentClass, isLoadingStudentData, studentDataError, refetchStudentData } = useData();
  return {
    data: studentClass,
    isLoading: isLoadingStudentData,
    error: studentDataError,
    refetch: refetchStudentData,
  };
}

export function useCachedStudentSubjects() {
  const { studentSubjects, isLoadingStudentData, studentDataError, refetchStudentData } = useData();
  return {
    data: studentSubjects,
    isLoading: isLoadingStudentData,
    error: studentDataError,
    refetch: refetchStudentData,
  };
}

export { DataContext };
