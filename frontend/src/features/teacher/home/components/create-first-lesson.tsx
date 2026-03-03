"use client"
import Image from "next/image"
import Link from "next/link"

export function CreateFirstLesson() {
    return (
        <>
            <div className="mt-16 mb-6">
                <h2 className="text-base font-semibold text-[#353535]">Recent Activity</h2>
            </div>
            <section
                className="relative w-full rounded-xl bg-[#F7F4FB] overflow-hidden"
            >
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-8 items-start p-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-semibold text-[#353535]">You're all set to begin</h1>
                            <p className="text-base text-[#353535] max-w-[350px]">Your recent activity will appear here once you start creating lessons, quizzes, or assessments</p>
                        </div>
                        <Link href="/lesson-plan" className="bg-[#DF6647] text-white text-base font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity inline-block">
                            Create your first lesson
                        </Link>
                    </div>

                    <div className="flex items-center justify-center">
                        <Image src="/images/announcements.svg" alt="Create first lesson" width={250} height={300} className="scale-x-[-1]" />
                    </div>

                </div>
            </section>
        </>
    )
}
