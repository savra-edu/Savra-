import { Suspense } from "react"
import AdminAskSavraPage from "@/features/admin/ask-savra/components/admin-ask-savra-page"

function AdminAskSavraLoading() {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="w-8 h-8 border-4 border-[#9B61FF] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function AdminAskSavraPageRoute() {
  return (
    <div className="flex flex-col w-full h-full">
      <Suspense fallback={<AdminAskSavraLoading />}>
        <AdminAskSavraPage />
      </Suspense>
    </div>
  )
}
