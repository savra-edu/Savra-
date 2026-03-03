import { Suspense } from "react";
import AskSavraPage from "@/features/teacher/ask-savra/components/ask-savra-page";

function AskSavraPageLoading() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-[#9B61FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
}

export default function AskSavraPageRoute() {
    return (
        <div className="flex flex-col w-full h-full">
            <Suspense fallback={<AskSavraPageLoading />}>
                <AskSavraPage />
            </Suspense>
        </div>
    )
}
