'use client'
import { FeatureCard } from "@/components/cards";
import FeaturePageLayout from "@/components/feature-page-layout";
import { useRouter } from "next/navigation";

export default function Announcements() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-white">
      <FeaturePageLayout>
        <FeatureCard
          icon="/lesson-planning.svg"
          title="Announcements"
          description="Savra replaces scattered WhatsApp messages and last-minute reminders with one clear announcement space. You can send instructions, homework reminders, or important notices directly to your class."
          descriptionBottom="Announcements can be crafted, edited, reused, or scheduled anytime. Everything stays organised by date, so you never have to search old messages again. This helps students stay informed and reduces repeated follow ups for teachers. Communication becomes simple, clear, and professional."
          desktopImages={[
            '/an-2.png',
            '/an-1.png',
          ]}
          mobileImages={[
            '/announcements-mobile.png',
            '/create-announcement.png',
          ]}
          cardBgColor="bg-[#F3E8F5]"
          buttonBgColor="bg-[#E8D5ED]"
          onGetStarted={() => router.push('/onboarding')}
        />
      </FeaturePageLayout>
    </main>
  );
}
