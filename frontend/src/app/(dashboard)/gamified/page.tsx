'use client'
import { FeatureCard } from "@/components/cards";
import FeaturePageLayout from "@/components/feature-page-layout";
import { useRouter } from "next/navigation";

export default function Gamified() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white">
      <FeaturePageLayout>
        <FeatureCard
          icon="/lesson-planning.svg"
          title="Gamified Quizzes"
          description="Savra lets you run quick classroom quizzes that students enjoy participating in. You can create chapter wise quizzes in a few clicks and use them for revision, recap, or concept checks during class."
          descriptionBottom="The quizzes include scores, leaderboards, and rewards that keep students engaged without turning learning into pressure. Questions are personalised to the chapter being taught, so students stay focused on what matters. Teachers get instant feedback on understanding, without extra correction work later."
          desktopImages={[
            '/generate-a-quiz.png',
            '/create-a-quiz.png',
          ]}
          mobileImages={[
            '/create-quiz-mobile.png',
            '/generate-quiz-mobile.png',
          ]}
          cardBgColor="bg-[#EDFAFE]"
          buttonBgColor="bg-[#E1F8FF]"
          onGetStarted={() => router.push('/onboarding')}
        />
      </FeaturePageLayout>
    </main>
  );
}
