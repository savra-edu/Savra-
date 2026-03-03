// Subject and Class configuration based on NCERT Books (Class 6-12)
// Reference: https://drive.google.com/drive/folders/1PJzK5mRmTbw9Jo4p2QxFUBcZNPKpDmAr

export interface ClassSubjectMap {
  class: number
  subjects: string[]
}

export interface SubjectInfo {
  name: string
  classes: number[] // Classes where this subject is available (6-12)
}

// Subjects available for Classes 6-12 based on NCERT curriculum
export const CLASS_SUBJECTS: ClassSubjectMap[] = [
  {
    class: 6,
    subjects: [
      "Mathematics",
      "Science",
      "English",
      "Hindi",
      "Social Science",
      "History",
      "Geography",
      "Political Science (Civics)",
    ],
  },
  {
    class: 7,
    subjects: [
      "Mathematics",
      "Science",
      "English",
      "Hindi",
      "Social Science",
      "History",
      "Geography",
      "Political Science (Civics)",
    ],
  },
  {
    class: 8,
    subjects: [
      "Mathematics",
      "Science",
      "English",
      "Hindi",
      "Social Science",
      "History",
      "Geography",
      "Political Science (Civics)",
    ],
  },
  {
    class: 9,
    subjects: [
      "Mathematics",
      "Science",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Hindi",
      "Social Science",
      "History",
      "Geography",
      "Political Science (Civics)",
      "Economics",
      "Computer Science",
    ],
  },
  {
    class: 10,
    subjects: [
      "Mathematics",
      "Science",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Hindi",
      "Social Science",
      "History",
      "Geography",
      "Political Science (Civics)",
      "Economics",
      "Computer Science",
    ],
  },
  {
    class: 11,
    subjects: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Hindi",
      "History",
      "Geography",
      "Political Science (Civics)",
      "Economics",
      "Computer Science",
    ],
  },
  {
    class: 12,
    subjects: [
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
      "English",
      "Hindi",
      "History",
      "Geography",
      "Political Science (Civics)",
      "Economics",
      "Computer Science",
    ],
  },
]

// Get all unique subjects across all classes
export const getAllSubjects = (): string[] => {
  const subjectSet = new Set<string>()
  CLASS_SUBJECTS.forEach((classData) => {
    classData.subjects.forEach((subject) => subjectSet.add(subject))
  })
  return Array.from(subjectSet).sort()
}

// Get subjects for a specific class
export const getSubjectsForClass = (classNumber: number): string[] => {
  const classData = CLASS_SUBJECTS.find((c) => c.class === classNumber)
  return classData?.subjects || []
}

// Get all classes that offer a specific subject
export const getClassesForSubject = (subjectName: string): number[] => {
  return CLASS_SUBJECTS.filter((classData) =>
    classData.subjects.includes(subjectName)
  ).map((classData) => classData.class)
}

// Get subject information with class availability
export const getSubjectInfo = (subjectName: string): SubjectInfo => {
  return {
    name: subjectName,
    classes: getClassesForSubject(subjectName),
  }
}
