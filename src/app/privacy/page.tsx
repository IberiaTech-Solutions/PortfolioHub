import type { Metadata } from "next";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Privacy Policy - TalentAgent",
  description: "Privacy Policy for TalentAgent",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <ShieldCheckIcon className="w-4 h-4" />
            Privacy Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Your Privacy Matters
          </h1>
          <p className="text-gray-400">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Information We Collect</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We collect information you provide directly to us, such as when you create an account,
              update your profile, or contact us for support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services,
              communicate with you, and ensure the security of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Information Sharing</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:luis.lozoya.tech@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                luis.lozoya.tech@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
