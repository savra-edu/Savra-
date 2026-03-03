"use client"

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const router = useRouter();

  const handleStudentClick = () => {
    router.push('/student/login');
  };

  const handleTeacherClick = () => {
    router.push('/teacher/login');
  };

  return (
    <div className="min-h-screen w-full bg-[#F9F9F9] flex items-center justify-center p-4 md:p-0 overflow-x-auto">
      {/* Desktop layout with absolute positioning */}
      <section className="hidden md:block relative w-full max-w-[1728px] min-h-screen md:h-[1117px] md:w-[1728px] md:min-h-[1117px] bg-[#F9F9F9] flex-shrink-0 mx-auto">
        <div className="absolute left-[292px] top-[95px] w-[1145px] h-[873px] rounded-[32px] opacity-40">
          <div 
            className="absolute inset-0 rounded-[32px] p-[1px]"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(223, 102, 71, 1) 91%)',
            }}
          >
            <div 
              className="w-full h-full rounded-[31px] shadow-[0px_4px_93px_0px_rgba(0,0,0,0.15)]"
              style={{
                background: 'linear-gradient(180deg, rgba(236, 231, 243, 1) 0%, rgba(252, 254, 255, 1) 100%)',
              }}
            />
          </div>
        </div>
        <div className="relative z-10 w-full h-full">
          <div className="absolute left-[758px] top-[157px] w-[246px] h-[86px] relative">
            <Image
              src="/images/savra-logo-45456f.png"
              alt="Savra Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="absolute left-[744px] top-[225px] w-[275px] text-left font-semibold text-2xl leading-[1.5em] text-black" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '24px', lineHeight: '1.5em' }}>
            I will be using Savra as
          </h1>

          <div className="absolute left-[561px] top-[407px] w-[288px] h-[287px] bg-white rounded-[22px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2" style={{ width: '258px', height: '188px' }}>
              <Image
                src="/images/group-2-2c228b.png"
                alt="Student"
                width={258}
                height={300}
                className="object-contain"
                style={{ 
                  width: '258px', 
                  height: '220px', 
                  objectFit: 'contain', 
                  objectPosition: 'center bottom',
                  display: 'block'
                }}
              />
            </div>
            
            <button 
              onClick={handleStudentClick}
              className="absolute left-[79px] top-[195px] bg-[#DF6647] rounded-[8px] text-white whitespace-nowrap hover:bg-[#DF6647]/90 transition-colors" 
              style={{ 
                fontFamily: 'Avenir Next, sans-serif', 
                fontWeight: 700, 
                fontSize: '16px', 
                lineHeight: '1.5em',
                padding: '16px 32px'
              }}
            >
              Student
            </button>
          </div>

          <div className="absolute left-[889px] top-[407px] w-[288px] h-[287px] bg-white rounded-[22px] shadow-[0px_4px_21px_0px_rgba(0,0,0,0.02)] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
            <div className="absolute top-[6px] left-1/2 -translate-x-1/2" style={{ width: '220px', height: '188px' }}>
              <Image
                src="/images/group-1-657d7a.png"
                alt="Teacher"
                width={220}
                height={281}
                className="object-contain"
                style={{ 
                  width: '220px', 
                  height: '220px', 
                  objectFit: 'contain', 
                  objectPosition: 'center bottom',
                  display: 'block'
                }}
              />
            </div>
            
            <button 
              onClick={handleTeacherClick}
              className="absolute left-[78px] top-[195px] bg-[#DF6647] rounded-[8px] text-white whitespace-nowrap hover:bg-[#DF6647]/90 transition-colors" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif', 
                fontWeight: 700, 
                fontSize: '16px', 
                lineHeight: '1.5em',
                padding: '16px 32px'
              }}
            >
              Teacher
            </button>
          </div>

          <p className="absolute left-[611px] top-[775px] w-[518px] text-center font-normal text-sm leading-[1.5em] text-black" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '1.5em' }}>
            By continuing, you confirm that you have read and agree to the{' '}
            <a href="#" className="hover:underline" style={{ color: '#8B5CF6' }}>terms and conditions</a>
            {' '}, Data protection addendum, and{' '}
            <a href="#" className="hover:underline" style={{ color: '#8B5CF6' }}>privacy policy</a>.
          </p>
          <div className="absolute left-[816px] top-[838px] flex items-center justify-center gap-2">
            <div className="w-[17px] h-[17px] relative flex-shrink-0">
              <Image
                src="/images/language-flag-1.png"
                alt="Language"
                fill
                className="object-contain"
              />
            </div>
            <button className="text-[#DF6647] font-normal text-sm leading-[1.5em] hover:underline whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '1.5em' }}>
              Change Language
            </button>
          </div>
        </div>
      </section>

      {/* Mobile layout with flexbox */}
      <div className="md:hidden w-full max-w-md mx-auto flex flex-col items-center py-8 px-4">
        {/* Logo */}
        <div className="w-[200px] h-[70px] relative mb-6">
          <Image
            src="/images/savra-logo-45456f.png"
            alt="Savra Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-center font-semibold text-2xl leading-[1.5em] text-black mb-8" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: '24px', lineHeight: '1.5em' }}>
          I will be using Savra as
        </h1>

        {/* Student Card */}
        <div className="w-full max-w-[288px] h-[287px] bg-white rounded-[22px] mb-6 relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[258px] h-[188px]">
            <Image
              src="/images/group-2-2c228b.png"
              alt="Student"
              width={258}
              height={300}
              className="object-contain"
              style={{ 
                width: '258px', 
                height: '220px', 
                objectFit: 'contain', 
                objectPosition: 'center bottom',
                display: 'block'
              }}
            />
          </div>
          
          <button 
            onClick={handleStudentClick}
            className="absolute left-1/2 -translate-x-1/2 top-[195px] bg-[#DF6647] rounded-[8px] text-white whitespace-nowrap hover:bg-[#DF6647]/90 transition-colors" 
            style={{ 
              fontFamily: 'Avenir Next, sans-serif', 
              fontWeight: 700, 
              fontSize: '16px', 
              lineHeight: '1.5em',
              padding: '16px 32px'
            }}
          >
            Student
          </button>
        </div>

        {/* Teacher Card */}
        <div className="w-full max-w-[288px] h-[287px] bg-white rounded-[22px] mb-8 relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow shadow-[0px_4px_21px_0px_rgba(0,0,0,0.02)]">
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[220px] h-[188px]">
            <Image
              src="/images/group-1-657d7a.png"
              alt="Teacher"
              width={220}
              height={281}
              className="object-contain"
              style={{ 
                width: '220px', 
                height: '220px', 
                objectFit: 'contain', 
                objectPosition: 'center bottom',
                display: 'block'
              }}
            />
          </div>
          
          <button 
            onClick={handleTeacherClick}
            className="absolute left-1/2 -translate-x-1/2 top-[195px] bg-[#DF6647] rounded-[8px] text-white whitespace-nowrap hover:bg-[#DF6647]/90 transition-colors" 
            style={{ 
              fontFamily: 'Montserrat, sans-serif', 
              fontWeight: 700, 
              fontSize: '16px', 
              lineHeight: '1.5em',
              padding: '16px 32px'
            }}
          >
            Teacher
          </button>
        </div>

        {/* Change Language */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-[17px] h-[17px] relative flex-shrink-0">
            <Image
              src="/images/language-flag-1.png"
              alt="Language"
              fill
              className="object-contain"
            />
          </div>
          <button className="text-[#DF6647] font-normal text-sm leading-[1.5em] hover:underline whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '1.5em' }}>
            Change Language
          </button>
        </div>

        {/* Terms and Conditions */}
        <p className="text-center font-normal text-sm leading-[1.5em] text-black px-4" style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 400, fontSize: '14px', lineHeight: '1.5em' }}>
          By continuing, you confirm that you have read and agree to the{' '}
          <a href="#" className="hover:underline" style={{ color: '#8B5CF6' }}>terms and conditions</a>
          {' '}, Data protection addendum, and{' '}
          <a href="#" className="hover:underline" style={{ color: '#8B5CF6' }}>privacy policy</a>.
        </p>
      </div>
    </div>
  );
}
