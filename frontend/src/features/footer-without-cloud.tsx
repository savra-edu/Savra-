import Footer from "./hero/footer";


export default function FooterWithoutCloud() {
    return (
        <div className="flex flex-col justify-center items-center w-full max-w-none">
            <h1 className="text-[80px] md:text-[120px] lg:text-[180px] text-[#C7AFFF] font-bold opacity-20">
                SAVRA
            </h1>
            <div className="w-full">
                <Footer />
            </div>
        </div>
    )
}
