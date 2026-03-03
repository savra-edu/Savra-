import type { Metadata } from "next";
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: "SAVRA - Your AI Teaching Companion",
  description: "SAVRA is an AI-powered teaching companion that helps teachers create lesson plans, activities, and assessments more quickly and easily.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
