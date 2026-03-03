import Image from "next/image";
import Footer from "./hero/footer";

export default function Footers() {
    return (
        <div className="flex flex-col justify-center items-center w-full max-w-none">
            <Image src="/cloud.svg" alt="FAQ" width={1000} height={1000} className="-mt-92 z-600 w-full" />
            <h1 className="text-[80px] md:text-[120px] lg:text-[180px] text-[#C7AFFF] font-bold opacity-20">
                SAVRA
            </h1>
            <div className="w-full">
                <Footer />
            </div>
        </div>
    )
}
