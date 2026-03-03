'use client'
import { FeatureCard } from "@/components/cards";
import FeaturePageLayout from "@/components/feature-page-layout";
import { useRouter } from "next/navigation";

export default function Analytics() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white">
      <FeaturePageLayout>
        <FeatureCard
          icon="/lesson-planning.svg"
          title="Class Analytics"
          description="Savra shows teachers exactly what is happening in the classroom, chapter by chapter. You can see how many students attempted a quiz, the average score, and the completion rate at a glance. Everything is organised by class and subject, so nothing gets lost. Go deeper into performance without extra work. Savra highlights score distribution, top questions missed, and common wrong answers. This helps teachers quickly identify which concepts students are struggling with and why, not just who scored low."
          descriptionBottom="Each quiz also comes with clear insights and recommended actions. Teachers know what to revise, what to reteach, and what practice to assign next. All analytics are aligned with competency based learning under NEP 2020, without complex reports or manual analysis."
          desktopImages={[
            '/ove2.png',
            '/overview.png',
          ]}
          mobileImages={[
            '/a2.png',
            '/a1.png',
          ]}
          cardBgColor="bg-[#F7ECD2]"
          buttonBgColor="bg-[#F8E9BF]"
          onGetStarted={() => router.push('/onboarding')}
        />
      </FeaturePageLayout>
    </main>
  );
}
