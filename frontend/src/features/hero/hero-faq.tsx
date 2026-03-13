import Image from "next/image";
import FAQAccordion from "./faq-accordian";
import Footer from "./footer";

export default function HeroFAQ() {
    const faqItems = [
        {
          id: 'what-is-savra',
          question: 'What is Savra',
          answer: 'Savra is an online tool that uses artificial intelligence to help teachers and educators create lesson plans, activities, and assessments more quickly and easily. Think of it like having a digital assistant that gives you ideas, helps you organize your teaching materials, and saves you time so you can focus on your students.',
        },
        {
          id: 'differ-from-others',
          question: 'How does Savra differ from other AI tools?',
          answer: 'Savra is designed specifically to meet the needs of teachers in the classroom. While many AI tools offer a broad range of capabilities, Savra stands out by focusing on: Curriculum Alignment Structured Lesson Planning Teacher-Centric Design Assessment & Activity Creation Privacy and Classroom Needs Community and Support',
        },
        {
          id: 'suitable-beginners',
          question: 'Is Savra suitable for beginners using AI?',
          answer: 'Yes! Savra is designed to be user-friendly especially for people new to AI. The platform handles the complex AI prompting in the background so all you have to do is specify the subject matter you\'re teaching and the context you work in.',
        },
        {
          id: 'one-on-one-support',
          question: 'How does Savra empower teachers to provide one-on-one student support?',
          answer: 'Savra leverages advanced AI to personalize homework for each student. This includes assigning personalized homework assignments, guiding them, providing detailed insights about individual student learning gaps. Once these gaps are identified, Savra assists teachers in implementing targeted remedial plans personalized to each student\'s specific needs.',
        },
        {
          id: 'support-school-leaders',
          question: 'How does Savra support school leaders?',
          answer: 'Savra gives school leaders clear dashboards to track teacher input, student outcomes, and school-wide performance. This helps in making smart decisions, improving planning, and ensuring better use of time and resources.',
        },
      ];
    return (
        <div className="flex flex-col -mt-12 md:-mt-20 lg:-mt-24 justify-center items-center w-full">
            <Image src="/books.svg" alt="FAQ" width={1000} height={1000} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 800px, 1000px" className="-mb-20 md:-mb-56 lg:-mb-72 z-500 w-full max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] h-auto" />
            <div className="px-4 md:px-6 lg:px-8">
                <FAQAccordion items={faqItems} />
            </div>
            <div className="w-full">
            <Image src="/cloud.svg" alt="FAQ" width={1000} height={1000} sizes="100vw" className="-mt-20 md:-mt-40 lg:-mt-130 z-600 w-full h-auto" />
            </div>
            <h1 className="text-[80px] md:text-[120px] lg:text-[180px] text-[#C7AFFF] font-bold opacity-40">
                SAVRA
            </h1>
            <Footer />
        </div>
    )
}
