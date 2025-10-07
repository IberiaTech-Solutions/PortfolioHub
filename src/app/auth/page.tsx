import Auth from "@/components/Auth";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <div className="">
      <Suspense fallback={<div className="min-h-screen flex bg-white items-center justify-center">Loading...</div>}>
        <Auth />
      </Suspense>
    </div>
  );
}
