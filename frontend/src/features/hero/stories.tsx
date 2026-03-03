import TestimonialsCarousel from "@/components/testimonial-carousel";

export default function Stories() {
    const testimonials = [
        {
          id: '1',
          name: 'Sweety Khanna',
          role: 'Senior Coordinator Spring',
          avatar: 'SK',
          text: 'AI-powered tools are a game changer. I created assessments, lesson plans and rubrics in minutes, and they are all NEP-aligned',
        },
        {
          id: '2',
          name: 'Meenakshi Sharma',
          role: 'Baruas Public Primary Teacher',
          avatar: 'MS',
          text: 'Slick, simple, and easy to make ours. Helps me save a lot of time in lesson planning and class activities',
        },
        {
          id: '3',
          name: 'Rachna Mehta',
          role: 'Principal, Accord International',
          avatar: 'RM',
          text: 'With Savra, I finally have visibility across classrooms. The insights help me guide teachers more effectively and align with our school\'s academic goals',
        },
        {
          id: '4',
          name: 'Ritu Grover',
          role: 'Teacher, DAV International School',
          avatar: 'RG',
          text: 'Onboarding was quick and always available. Savra is intuitive that our old ERP seemed outdated',
        },
        {
            id: '5',
            name: 'Varun Kapoor',
            role: 'Teacher, The Modern School',
            avatar: 'VK',
            text: 'Honestly, I was tired of Googling for NEP-aligned questions. With Savra, I just type the topic and I get questions, case studies, everything. I don’t need to search anywhere else',
        },
        {
            id: '6',
            name: 'Deepak Varma',
            role: 'Teacher, Vasant Valley School',
            avatar: 'DV',
            text: 'Savra is like my personal teaching assistant. Whether I need a worksheet, a quiz, or even a case-based question it’s there. I don’t know how I managed without it before!',
        },
        {
            id: '7',
            name: 'Kavita Sinha',
            role: 'Teacher, Carmel Convent School',
            avatar: 'KS',
            text: 'I used to spend half my Sunday making lesson plans. Now with Savra, it’s literally 10 minutes and I’m done. It’s made my life so much easier.',
        },
        {
            id: '8',
            name: 'Anita Yadav',
            role: 'Teacher, Doon Public School',
            avatar: 'AY',
            text: 'What I love most about Savra is the fun activities and examples it suggests. My classroom feels more alive, and the students are actually enjoying the concepts now.',
        },
        
      ];
    return (
        <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-10 justify-center items-center w-full">
            <div className="text-[32px] md:text-[40px] lg:text-[48px] font-semibold text-[#1F2937] text-center">
            Real stories from real classrooms
            </div>
            <div className="text-[#4B5563] text-sm md:text-base text-center">
            Hundred of reviews & testimonials 
            </div>
            <TestimonialsCarousel testimonials={testimonials} />
        </div>
    )
}