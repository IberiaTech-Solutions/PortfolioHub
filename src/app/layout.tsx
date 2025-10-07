import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortfolioHub - Showcase Your Work",
  description: "Connect with talented professionals and showcase your skills to the world. Find developers, designers, and creators.",
  icons: {
    icon: '/images/PortfolioHub6.png',
    shortcut: '/images/PortfolioHub6.png',
    apple: '/images/PortfolioHub6.png',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
