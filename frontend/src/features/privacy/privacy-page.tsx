export default function PrivacyPolicy() {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#010D3E] mb-12">
            Privacy Policy – Savra Edu Private Limited
          </h1>
  
          {/* Content */}
          <div className="space-y-6 text-[#010D3E] leading-tight">
            {/* Section 1 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">1. What Information We Collect</h2>
              <p>We collect two kinds of information:</p>
  
              <div className="space-y-4 ml-4">
                <div>
                  <p className="font-bold text-[#010D3E]">
                    a. Personal Information (for registration and personalization):
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>School/Institution name</li>
                    <li>Grade(s) and subject(s) taught</li>
                  </ul>
                </div>
  
                <div>
                  <p className="font-bold text-[#010D3E]">
                    b. Usage Information (to improve our platform):
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li>Time spent on features (e.g., lesson planning, quiz builder)</li>
                    <li>Click patterns, user preferences, and resource downloads</li>
                    <li>Feedback or queries submitted</li>
                  </ul>
                </div>
  
                <div>
                  <p className="font-bold text-[#010D3E]">c. Uploaded Content:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
                    <li>
                      Lesson plans, assessments, PPTs, notes, and any documents uploaded by the user
                    </li>
                    <li>
                      We do not collect or store any personally identifiable student data.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
  
            {/* Section 2 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">2. How We Use Your Data</h2>
              <p>We use the data:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  To help you generate lesson plans, question papers, and classroom activities aligned to NEP/NCF frameworks.
                </li>
                <li>
                  To improve feature suggestions based on your teaching level and usage behavior.
                </li>
                <li>
                  To respond to queries and provide customer support.
                </li>
                <li>
                  To send occasional product updates or feedback forms (optional opt-out).
                </li>
              </ul>
            </div>
  
            {/* Section 3 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">3. Who Can Access Your Data</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Your data is visible only to you.</li>
                <li>It is never sold or shared with third parties for marketing.</li>
                <li>
                  Internal team members may access limited data for debugging or product improvement—under strict confidentiality agreements.
                </li>
              </ul>
            </div>
  
            {/* Section 4 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">4. Security and Storage</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>All data is stored on secure, encrypted servers hosted in India.</li>
                <li>Passwords and sensitive data are encrypted and never visible to anyone.</li>
                <li>Regular backups and audits ensure data safety.</li>
              </ul>
            </div>
  
            {/* Section 5 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">5. Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  You may delete your account or request a data export anytime by writing to <a href="mailto:savra.edu@gmail.com" className="text-blue-600 hover:text-blue-800 underline cursor-pointer">savra.edu@gmail.com</a>
                </li>
                <li>We'll act on your request within 7 working days.</li>
              </ul>
            </div>
  
            {/* Section 6 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">6. Cookies and Analytics</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  We use cookies to remember your preferences and improve performance.
                </li>
                <li>
                  Google Analytics may collect anonymized usage data (e.g., browser type, location) to help us understand platform performance.
                </li>
              </ul>
            </div>
  
            {/* Section 7 */}
            <div className="space-y-3">
              <h2 className="font-bold text-[#010D3E]">7. Changes to This Policy</h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  We'll notify you of any significant changes via email or platform notification.
                </li>
                <li>
                  Continued usage of the platform implies consent to the updated terms.
                </li>
              </ul>
            </div>
  
            {/* Footer dot */}
            <p className="pt-8 text-gray-400">·</p>
          </div>
        </div>
      </main>
    )
  }
  