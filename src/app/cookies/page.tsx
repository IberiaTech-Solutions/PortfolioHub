import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - TalentAgent",
  description: "Cookie Policy for TalentAgent",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm font-bold mb-6">
            <span>🍪</span>
            Cookie Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-400">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">What Are Cookies</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you
              visit our website. They help us provide you with a better experience by remembering your
              preferences and analyzing how you use our site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">How We Use Cookies</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use cookies to authenticate users, remember your preferences, analyze site traffic,
              and improve our services. We also use cookies for security purposes to protect against
              unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Types of Cookies</h2>
            <div className="text-gray-400 text-sm leading-relaxed space-y-2">
              <p><strong className="text-gray-300">Essential Cookies:</strong> Necessary for the website to function properly.</p>
              <p><strong className="text-gray-300">Authentication Cookies:</strong> Keep you logged in to your account.</p>
              <p><strong className="text-gray-300">Preference Cookies:</strong> Remember your settings and preferences.</p>
              <p><strong className="text-gray-300">Analytics Cookies:</strong> Help us understand how visitors use our site.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Managing Cookies</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              You can control and manage cookies through your browser settings. However, please note
              that disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              If you have any questions about our use of cookies, please contact us at{" "}
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
