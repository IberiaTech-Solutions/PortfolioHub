import Auth from "@/components/Auth";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Suspense fallback={<div className="min-h-screen flex bg-slate-900 items-center justify-center text-white">Loading...</div>}>
        <Auth />
      </Suspense>
    </div>
  );
}
