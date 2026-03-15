import type { Metadata } from "next";
import { Inter, Roboto, Poppins } from "next/font/google";
import "./globals.css";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import PageTransition from "@/components/PageTransition";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://talentagent.com"),
  title: {
    default: "TalentAgent — AI-Powered Talent Platform",
    template: "%s | TalentAgent",
  },
  description: "Stop competing with 400 applicants. Your AI agent showcases your depth, matches you to jobs honestly, and controls your narrative.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "TalentAgent — AI-Powered Talent Platform",
    description: "Stop competing with 400 applicants. Your AI agent showcases your depth, matches you to jobs honestly, and controls your narrative.",
    siteName: "TalentAgent",
    type: "website",
    images: [{ url: "/favicon.svg", width: 64, height: 64, alt: "TalentAgent" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentAgent — AI-Powered Talent Platform",
    description: "Stop competing with 400 applicants. Your AI agent showcases your depth, matches you to jobs honestly, and controls your narrative.",
    images: ["/favicon.svg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily disable Supabase server client to avoid cookies() warning in dev
  // const supabase = createServerComponentClient({ cookies });
  // await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${roboto.variable} ${poppins.variable} font-body antialiased`}
      >
        <ToastProvider>
          <Suspense fallback={<div className="h-16 bg-slate-900"></div>}>
            <Navigation />
          </Suspense>
          <main><PageTransition>{children}</PageTransition></main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
