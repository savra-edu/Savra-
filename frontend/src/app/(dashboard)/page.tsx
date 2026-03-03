import CoreFeatures from "@/features/hero/core-features";
import GotEasier from "@/features/hero/got-easier-section";
import HeroFAQ from "@/features/hero/hero-faq";
import HeroMain from "@/features/hero/hero-main";
import HeroVideo from "@/features/hero/hero-video";
import LessonPlans from "@/features/hero/lesson-plans";
import Stories from "@/features/hero/stories";
import Working from "@/features/hero/working";

export default function Dashboard() {
  return (
    <div className="w-full flex flex-col gap-12 md:gap-16 lg:gap-24">
      <HeroMain />
      <HeroVideo/>
      <Working />
      <GotEasier/>
      <LessonPlans/>
      <CoreFeatures/>
      <Stories/>
      <HeroFAQ/>
    </div>
  )
}