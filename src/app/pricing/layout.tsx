import { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Free forever for candidates. Pro and Recruiter plans for those who want an unfair advantage. Simple, transparent pricing.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
