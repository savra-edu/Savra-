import CoreFeaturesCarousel from '@/components/core-features-carousel';

export default function CoreFeatures() {
  const features = [
    {
      id: 'lesson-planning',
      title: 'Lesson Planning',
      description:
        'CBSE + NEP 2020-aligned lesson plans for every subject and class. Just select grade, subject, and chapter – Savra AI does the rest.',
      bullets: [
        'Aligned with NEP 2020 & NCF 2023',
        'Multilingual & editable output',
        'Fully customizable formats',
      ],
      webAppImage: '/lesson-plan.png',
      phoneImage: '/generated-plan.png',
      cardGradient: 'linear-gradient(180deg, #F8B5C9 0%, #E990AB 100%)',
      tabColor: '#F49AB5',
    },
    {
      id: 'assessments',
      title: 'Assessments',
      description:
        'Aligned with NEP 2020, NCF 2023 & Competency-Based Learning Create question papers, worksheets, and quizzes that reflect India\'s new education priorities. Every assessment is mapped to learning outcomes and competencies.',
      bullets: [
        'Covers competency-based question types (HOTS, case studies, application-based)',
        'Tag questions to specific skills and themes',
      ],
      webAppImage: '/modify-prompt.png',
      phoneImage: '/phone-modify.png',
      cardGradient: 'linear-gradient(180deg, #93EBF9 0%, #83CAD6 100%)',
      tabColor: '#93EBF9',
    },
    {
      id: 'gamified-quizzes',
      title: 'Gamified Quizzes',
      description:
        'Conduct classroom quizzes with a click. Leaderboards, coin rewards, and personalized questions based on chapters.',
      bullets: [
        'Perfect for quick checks & revisions',
        'Built for low-device classrooms',
      ],
      webAppImage: '/quiz.png',
      phoneImage: '/generated-quiz.png',
      cardGradient: 'linear-gradient(180deg, #FFEDBE 0%, #FFE08D 100%)',
      tabColor: '#FFEDBE',
    },
    {
      id: 'announcements',
      title: 'Announcements',
      description:
        'Your In-Class Notice Board – Reimagined Send reminders and instructions to students with a few taps. Draft, reuse, and schedule messages anytime.',
      bullets: [
        'Share notes, prep tasks, or alerts',
        'All messages saved & organized by date',
      ],
      webAppImage: '/announcements.png',
      phoneImage: '/create-new-announcemnent.png',
      cardGradient: 'linear-gradient(180deg, #E2E2FF 0%, #CACAFF 100%)',
      tabColor: '#E2E2FF',
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description:
        'Get Deep Insights on Student and Classroom Performance Monitor how each student, class, and grade is performing all aligned with NEP 2020 and Competency-Based Learning goals.',
      bullets: [
        'Track individual student progress across assessments',
        'Analyze grade and class-level trends',
        'View performance by skill, theme, and learning outcome',
      ],
      webAppImage: '/analytics.png',
      phoneImage: '/phone-analytics.png',
      cardGradient: 'linear-gradient(180deg, #E1F1C1 0%, #CFE694 100%)',
      tabColor: '#E1F1C1',
    },
  ];

  return (
    <main className="bg-white">
      <CoreFeaturesCarousel features={features} />
    </main>
  );
}
