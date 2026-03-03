import FooterWithoutCloud from "@/features/footer-without-cloud";
import PrivacyPolicy from "@/features/privacy/privacy-page";

export default function Privacy() {
    return (
        <div className="flex flex-col justify-center items-center w-full">
            <PrivacyPolicy />
            <FooterWithoutCloud />
        </div>
    )
}