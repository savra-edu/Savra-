import Image from "next/image";
export default function Working() {
  return (
    <section>
      <div className="max-w-7xl p-4 md:p-6 lg:p-10 mx-auto">
        <Image src="/working.svg" alt="Working" width={100} height={100} className="w-full h-full" />
      </div>
    </section>
  );
}