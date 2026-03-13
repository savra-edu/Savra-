import Image from "next/image";
import Footer from "../hero/footer";
import FooterCTA from "./footer-cta";

export default function StoryFooter() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <FooterCTA />
            <div className="w-full">
                <Image src="/cloud.svg" alt="FAQ" width={1000} height={1000} sizes="100vw" className="-mt-20 md:-mt-60 lg:-mt-110 z-600 w-full h-auto" />
            </div>
            <h1 className="text-[80px] md:text-[120px] lg:text-[180px] text-[#C7AFFF] font-bold opacity-40">
                SAVRA
            </h1>
            <Footer />
        </div>
    )
}
