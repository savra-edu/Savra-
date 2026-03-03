import OurStory from "@/features/story/our-story";
import StoryFooter from "@/features/story/story-footer";

export default function OurStoryPage() {
    return (
        <div className="w-full flex flex-col gap-24">
            <OurStory />
            <StoryFooter />
        </div>
    )
}