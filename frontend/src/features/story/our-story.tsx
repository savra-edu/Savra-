import Image from 'next/image'

export default function OurStory() {
    return (
        <main className="min-h-screen bg-white p-4">
            {/* Top Section - Teal Background */}
            <section className="bg-[#BFF9EA] rounded-3xl mx-auto my-4 md:my-6 lg:my-8 p-6 md:p-8 lg:p-12 max-w-5xl w-full">
                <div className="space-y-6 md:space-y-8">
                    {/* Heading - Full Width */}
                    <div className="space-y-2 pt-2">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0A0B1E] leading-tight">
                            Two 20-year-olds
                        </h1>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#0A0B1E] leading-tight">
                            Passionate for education
                        </h2>
                    </div>

                    {/* Content - Paragraph and Images Side by Side */}
                    <div className="flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-12 items-center justify-center">
                        {/* Left - Paragraph */}
                        <div className="flex-1">
                            <p className="text-base md:text-lg lg:text-xl text-[#010D3E] leading-relaxed">
                                Priyana grew up seeing her mother, a CBSE teacher for over 15 years, spending late nights preparing lesson plans, checking notebooks, and handling school paperwork. When NEP and competency-based learning came in, the workload increased even more. Watching this happen inside her own home made Priyana realise how big and widespread the problem was. At the same time, Suvansh worked inside an IB school in Bangalore, closely observing teachers, coordinators, and students. He saw how the right systems made teaching smoother, but also saw that those systems weren't designed for CBSE or Indian curriculum schools. He also worked with students in low-income and rural classrooms, witnessing the same struggle in a different setting—teachers handling everything manually with no support. That's how we came together: two people seeing the same problem from two different angles and deciding to solve it together.
                            </p>
                        </div>

                        {/* Right - Images Stacked */}
                        <div className="flex flex-col gap-4 md:gap-6 w-full lg:w-1/3">
                            <Image className="rounded-2xl w-full h-auto" src="/image1.png" alt="Story" width={400} height={400} sizes="(max-width: 768px) 100vw, 33vw" />
                            <Image className="rounded-2xl w-full h-auto" src="/image2.png" alt="Story" width={400} height={400} sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Section - White Background */}
            <section className="bg-white py-8 md:py-12 lg:py-16 xl:py-24 px-4 md:px-6 lg:px-8 xl:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="flex flex-col">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl w-full md:w-[500px] font-bold text-black leading-tight">
                                Why are we building Savra
                            </h2>
                            <Image src="/decor.png" alt="Circle" width={450} height={450} sizes="450px" className="relative -left-20 md:-left-92 w-32 md:w-auto hidden md:block" />
                        </div>
                        <div className="text-sm md:text-base lg:text-lg text-[#010D3E] leading-relaxed space-y-3 md:space-y-4">
                            <p>
                                Savra is built to solve one of the biggest problems in Indian education: teachers spending more time on planning, paperwork, and documentation than actually teaching. Savra is a simple, supportive assistant that helps teachers create lesson plans, worksheets, assessments, competency trackers, and documentation in minutes—aligning with NEP 2020, NCF 2023, and competency-based learning. Our aim is to make teaching easier, classrooms more effective, and schools more organised.
                            </p>
                            <p>
                                Our vision is to take the Indian education system to global standards by supporting the people at the centre of it—teachers. We want to build a system where every teacher gets the tools they deserve, every school runs smoothly, and every student gets a personalised learning experience without making teachers work extra. The impact we want to create is clear: reduce teacher workload, improve learning outcomes, and help schools adapt to the new education reforms in the simplest way possible.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-start items-center -mt-20 md:-mt-46 gap-2 md:gap-4 mt-8 md:mt-0">
                        <div className="flex flex-col items-end justify-center gap-2">
                            <Image
                                src="/why1.png"
                                alt="why"
                                width={200}
                                height={400}
                                sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 200px"
                                className="rounded-2xl w-24 md:w-32 lg:w-[200px] h-auto"
                            />
                            <Image
                                src="/why2.png"
                                alt="why"
                                width={350}
                                height={200}
                                sizes="(max-width: 768px) 160px, (max-width: 1024px) 224px, 350px"
                                className="rounded-2xl w-40 md:w-56 lg:w-[350px] h-auto"
                            />
                        </div>
                        <Image
                            src="/why3.png"
                            alt="why"
                            width={600}
                            height={600}
                            sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 600px"
                            className="rounded-3xl w-48 md:w-64 lg:w-[600px] h-auto"
                        />
                    </div> 
                </div>
            </section>
        </main>
    )   
}
