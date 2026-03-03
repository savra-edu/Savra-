"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Share2, Download, Printer, FileText, Edit } from "lucide-react"
import Image from "next/image"

export default function LessonDetails() {
  const [expandedSections, setExpandedSections] = useState({
    introduction: true,
    coreExplanation: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto bg-white rounded-2xl shadow-sm">
        {/* Header */}
        <div className="bg-[#E9E9E9] px-12 py-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">7-B's Lesson Plan On Fraction</h1>
            <span className="text-[#000000]">•</span>
            <span className="text-[#000000]">45 minutes</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#E2DFF0] rounded-lg hover:opacity-80">
            Edit <Edit size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-12 py-8 space-y-4">
          {/* Introduction Section */}
          <div className="border border-gray-200 rounded-lg">
            {/* Section Header */}
            <button
              onClick={() => toggleSection("introduction")}
              className="w-full px-6 py-4 flex items-center gap-4 bg-[#F5F5F5] transition"
            >
              <div>
                <Image src="/images/intro.png" alt="Introduction" width={30} height={50} />
              </div>
              <span className="flex-1 text-left font-semibold text-basetext-gray-900">Introduction (5 mins)</span>
              <div className="text-purple-500">
                {expandedSections.introduction ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {/* Section Content */}
            {expandedSections.introduction && (
              <div className="px-6 pb-6 border-t border-gray-200 space-y-4">
                <h3 className="text-base font-bold text-gray-900 pt-4">What is Fraction?</h3>

                <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm ml-2">
                  <li>Think about sharing one pizza equally between two friends.</li>
                  <li>What do we do to share it fairly? We divide it into equal parts.</li>
                  <li>Each equal part of a whole is called a fraction.</li>
                  <li>When a whole is divided into two equal parts, each part is written as ½.</li>
                  <li>This means one part taken out of two equal parts.</li>
                  <li>If a whole is divided into four equal parts, one part is written as ¼.</li>
                  <li>We use fractions when sharing food, time, or objects in daily life.</li>
                  <li>Today, we will learn what fractions are and how to use them correctly.</li>
                </ol>

                <p className="text-gray-700 text-sm mt-4">
                  Fractions are used to represent parts of a whole when something is divided into equal parts. We use
                  fractions in everyday life while sharing food, time, and objects.
                </p>

                <p className="text-gray-700 text-sm">
                  Fractions are used to represent parts of a whole when something is divided into equal parts. We use
                  fractions in everyday life while sharing food, time, and objects.
                </p>
              </div>
            )}
          </div>

          {/* Core Explanation Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection("coreExplanation")}
              className="w-full px-6 py-4 flex items-center gap-4 bg-[#F5F5F5] transition"
            >
               <div>
                <Image src="/images/intro.png" alt="Introduction" width={30} height={50} />
              </div>
              <span className="flex-1 text-left font-semibold text-gray-900">Core Explanation (20 mins)</span>
              <div className="text-purple-500">
                {expandedSections.coreExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-12 py-6 border-t border-gray-200 flex items-center gap-3 flex-wrap">
          <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium">
            <Share2 size={18} /> Share
          </button>
          <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium">
            <Download size={18} /> Download
          </button>
          <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium">
            <Printer size={18} /> Print
          </button>
          <button className="flex text-sm items-center gap-2 px-4 py-2 bg-[#E2DFF0] text-gray-700 rounded-lg font-medium">
            <FileText size={18} /> Draft
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button className="px-6 py-2 text-sm border-2 border-[#DF6647] text-[#DF6647] rounded-lg font-medium">
              Modify Prompt
            </button>
            <button className="px-6 py-2 text-sm bg-[#DF6647] text-white rounded-lg font-medium">
              Save Lesson Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
