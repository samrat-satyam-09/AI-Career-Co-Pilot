import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/redux/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Career Co-Pilot | AI-Powered Career Tools",
    template: "%s | AI Career Co-Pilot",
  },
  description:
    "Supercharge your job search with AI-powered resume tailoring, JD matching, ATS scoring, mock interviews, and intelligent career guidance. Land your dream job faster.",
  keywords: [
    "AI resume builder",
    "ATS score checker",
    "job application tracker",
    "mock interview AI",
    "career co-pilot",
    "resume tailoring",
    "JD matching",
  ],
  authors: [{ name: "AI Career Co-Pilot" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "AI Career Co-Pilot",
    title: "AI Career Co-Pilot | AI-Powered Career Tools",
    description:
      "Supercharge your job search with AI-powered resume tailoring, JD matching, ATS scoring, mock interviews, and intelligent career guidance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Career Co-Pilot",
    description: "AI-Powered Career Tools for Job Seekers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#181A1B" />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

