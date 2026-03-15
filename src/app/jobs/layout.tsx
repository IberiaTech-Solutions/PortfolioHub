import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse AI-Matched Jobs",
  description: "Find jobs matched to your skills with AI fit scores, ghost job detection, and eligibility badges. Apply smarter, not harder.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
