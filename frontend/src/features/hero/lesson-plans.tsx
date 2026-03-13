import Image from "next/image";
export default function LessonPlans() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto justify-center items-center gap-8 md:gap-12 lg:gap-14 px-4 md:px-8 lg:px-14">
            <div className="relative bg-[#7451B4] max-w-3xl flex flex-col justify-start p-4 md:p-6 h-auto md:h-[550px] rounded-b-xl">
                {/* Notification SVG Overlay */}
                <Image 
                    src="/notfns.svg" 
                    alt="Notifications" 
                    width={650} 
                    height={500} 
                    sizes="(max-width: 768px) 128px, 650px"
                    className="absolute -top-8 md:-top-15 -left-2 z-20 w-32 md:w-auto"
                />
                <div className="text-3xl md:text-4xl lg:text-5xl mt-20 md:mt-32 font-semibold text-white">
                    Lesson Plans — Your Way, Anywhere
                </div>
                <div className="text-base md:text-[18px] mt-8 md:mt-14 font-medium text-white">
                    SAVRA lets you create lesson plans exactly the way you teach, not the way software forces you to.
                </div>
                <br />
                <div className="text-base md:text-[18px] font-medium text-white">
                    Whether you're at home, in school, or travelling, the SAVRA app helps you build CBSE- and NEP 2020–aligned lesson plans in minutes, right from your phone.
                </div>
            </div>
        <div className="order-first lg:order-last">           
             <div className="relative flex items-center justify-center">
              
              {/* Phone Image */}
              <Image 
                src="/mobile-phone.svg" 
                alt="Lesson Plans App" 
                width={600} 
                height={600} 
                sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 600px"
                className="relative z-10 object-cover w-full max-w-[300px] md:max-w-[400px] lg:max-w-[600px]"
                priority
              />
            </div>
            </div>
        </div>
    )
}
