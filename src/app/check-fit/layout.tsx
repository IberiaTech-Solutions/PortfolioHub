import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check Your Fit",
  description: "Paste any job description and get an honest AI fit score. Know if you should apply before wasting time.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
