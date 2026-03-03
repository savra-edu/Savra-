'use client'
import { FeatureCard } from "@/components/cards";
import FeaturePageLayout from "@/components/feature-page-layout";
import { useRouter } from "next/navigation";

export default function Assessments() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white">
      <FeaturePageLayout>
        <FeatureCard
          icon="/lesson-planning.svg"
          title="Assessments"
          description="With Savra, creating question papers and worksheets no longer takes an entire evening. You can generate assessments aligned with CBSE, NCF 2023, and competency based learning for any chapter or class in minutes with the answer key. Questions are thoughtfully designed. You get a mix of recall, application-based questions, case studies, and higher-order thinking, assertion reasoning questions that actually test understanding, not memorisation. Each question is mapped to skills and learning outcomes."
          descriptionBottom="Each quiz also comes with clear insights and recommended actions. Teachers know what to revise, what to reteach, and what practice to assign next. All analytics are aligned with competency based learning under NEP 2020, without complex reports or manual analysis."
          desktopImages={[
            '/edit.png',
            '/create.png',
          ]}
          mobileImages={[
            '/mobile-assessment-2.png',
            '/mobile-assessment.png',
          ]}
          cardBgColor="bg-[#F2FFD7]"
          buttonBgColor="bg-[#DCEEB6]"
          onGetStarted={() => router.push('/onboarding')}
        />
      </FeaturePageLayout>
    </main>
  );
}
