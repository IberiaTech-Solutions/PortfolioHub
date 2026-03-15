import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Applications",
  description: "Track every job you've applied to. Update status as you progress through interviews.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
