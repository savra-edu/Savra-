export default function TermsPage() {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-12 w-2xl">
            Terms & Conditions – Savra Edu Private Limited
          </h1>
  
          {/* Content */}
          <div className="space-y-6 text-[#010D3E] leading-tight">
            {/* Introduction */}
            <div className="space-y-3">
              <p className="font-semibold text-2xl text-black">
                Terms & Conditions – Savra Edu Private Limited
              </p>
              <p>
                These Terms govern the use of Savra and its AI-based features by educators.
              </p>
            </div>
  
            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">1. Platform Usage</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  You must be 18+ and an educator affiliated with a school to use the platform.
                </li>
                <li>
                  You agree to use Savra only for educational purposes (lesson planning, quizzes, assessments, teaching aids).
                </li>
              </ul>
            </div>
  
            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">2. User Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  You're responsible for the content you create or upload.
                </li>
                <li>
                  Please review any AI-generated content before using it in a live classroom.
                </li>
              </ul>
            </div>
  
            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">3. AI Usage & Content Ownership</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  AI-generated content (e.g., lesson plans, assessments) is owned by the teacher and can be freely downloaded or edited
                </li>
              </ul>
              <p className="ml-6 mt-3">
                Savra provides suggestions only and does not take liability for factual or curriculum errors.
              </p>
            </div>
  
            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">4. Prohibited Activities</h2>
              <p>Users must not:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Upload or share content that is illegal, abusive, or violates copyright.
                </li>
                <li>
                  Use automated tools to scrape or reverse engineer the platform.
                </li>
                <li>
                  Misuse the AI assistant for generating harmful, misleading, or discriminatory content.
                </li>
              </ul>
            </div>
  
            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">5. Product Changes and Downtime</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Savra is constantly evolving. We may add/remove features at our discretion.
                </li>
                <li>
                  Scheduled maintenance will be communicated in advance.
                </li>
                <li>
                  We are not liable for any interruption in service.
                </li>
              </ul>
            </div>
  
            {/* Section 6 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">6. Limitation of Liability</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Savra is an educational assistant, not a substitute for pedagogical judgment.
                </li>
                <li>
                  We do not guarantee absolute accuracy of generated content and suggest that all output be reviewed before classroom use.
                </li>
              </ul>
            </div>
  
            {/* Section 7 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">7. Governing Law</h2>
              <p>
                This Agreement shall be governed by the laws of India. Any disputes arising shall be subject to jurisdiction of Delhi courts.
              </p>
            </div>
  
            {/* Footer dot */}
            <p className="pt-8 text-gray-400">·</p>
          </div>
        </div>
      </main>
    )
  }
  