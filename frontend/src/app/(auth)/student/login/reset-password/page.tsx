import { Suspense } from "react";
import { ResetPassword } from "@/features/student/login/components/reset-password";

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#F9F9F9]">
      <div style={{ background: "linear-gradient(180deg, rgba(236, 231, 243, 1) 0%, rgba(252, 254, 255, 1) 100%)" }} className="w-full max-w-4xl rounded-2xl shadow-lg p-8 md:p-12 relative">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-[#242220]">Reset Password</h2>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPassword />
    </Suspense>
  );
}
