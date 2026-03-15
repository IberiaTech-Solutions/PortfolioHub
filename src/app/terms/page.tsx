import type { Metadata } from "next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Terms of Service - TalentAgent",
  description: "Terms of Service for TalentAgent",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <DocumentTextIcon className="w-4 h-4" />
            Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Acceptance of Terms</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              By accessing and using TalentAgent, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Use License</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Permission is granted to temporarily use TalentAgent for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">User Responsibilities</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Users are responsible for maintaining the confidentiality of their account information
              and for all activities that occur under their account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Prohibited Uses</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              You may not use our service for any unlawful purpose or to solicit others to perform
              or participate in any unlawful acts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Contact Information</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{" "}
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
