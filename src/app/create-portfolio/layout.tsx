import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Portfolio",
  description: "Build your AI-powered portfolio in 30 seconds. Import from resume or GitHub. Let your AI agent represent you to recruiters.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
