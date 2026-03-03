import FooterWithoutCloud from "@/features/footer-without-cloud";
import TermsPage from "@/features/terms/terms-page";

export default function Terms() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <TermsPage />
            <FooterWithoutCloud />
        </div>
    )
}