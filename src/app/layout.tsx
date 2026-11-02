import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewIQ — AI-Driven Adaptive Mock Interview System",
  description:
    "An AI-powered adaptive mock interview platform that analyzes resumes & job descriptions to generate personalized questions and evaluations. MCA Research Project.",
  keywords: [
    "AI Mock Interview",
    "Adaptive Interview System",
    "MCA Research",
    "Gemini API",
    "Resume Analysis",
    "Job Description Context",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900`}
      >
        {children}
      </body>
    </html>
  );
}
