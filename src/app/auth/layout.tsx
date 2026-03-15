import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in or create your TalentAgent account. Free forever for candidates.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
