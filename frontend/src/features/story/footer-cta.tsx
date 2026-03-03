import Image from "next/image";

export default function FooterCTA() {
    return (
        <section className="p-14 h-[85vh] rounded-3xl bg-[#D9D9FF] mx-auto max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
                <div className="flex-shrink-0">
                    <Image 
                        src="/kids.png" 
                        alt="Footer CTA" 
                        width={500} 
                        height={500} 
                        className="rounded-3xl"
                    />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0A0B1E] leading-tight mb-4">
                        Our goal is simple
                    </h2>
                    <p className="text-base md:text-lg text-[#0A0B1E]">
                        Give teachers their time back and make schools future-ready.
                    </p>
                </div>
            </div>
        </section>
    )
}