'use client'
import { FeatureCard } from "@/components/cards";
import FeaturePageLayout from "@/components/feature-page-layout";
import { useRouter } from "next/navigation";

export default function LessonPlan() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white">
      <FeaturePageLayout>
        <FeatureCard
          icon="/lesson-planning.svg"
          title="Lesson Planning"
          description="Savra helps you create complete lesson plans in minutes, not hours. You simply choose the class, subject, and chapter, and Savra builds a structured lesson that follows the CBSE syllabus and NEP 2020 guidelines. Objectives, teaching flow, classroom activities, and assessment ideas are all included."
          descriptionBottom="Whether you are planning for one period or a full week, Savra ensures your lessons stay aligned with learning outcomes while saving you daily preparation time."
          desktopImages={[
            '/modify-lesson.png',
            '/create-lesson.png',
          ]}
          mobileImages={[
            '/mobile-lesson.png',
            '/generated-plan.png',
          ]}
          cardBgColor="bg-[#F0FBF8]"
          buttonBgColor="bg-[#E4F8F2]"
          onGetStarted={() => router.push('/onboarding')}
        />
      </FeaturePageLayout>
    </main>
  );
}
