import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - PortfolioHub",
  description: "Cookie Policy for PortfolioHub",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you 
              visit our website. They help us provide you with a better experience by remembering your 
              preferences and analyzing how you use our site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies to authenticate users, remember your preferences, analyze site traffic, 
              and improve our services. We also use cookies for security purposes to protect against 
              unauthorized access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies</h2>
            <div className="text-gray-600 mb-4">
              <p className="mb-2"><strong>Essential Cookies:</strong> Necessary for the website to function properly.</p>
              <p className="mb-2"><strong>Authentication Cookies:</strong> Keep you logged in to your account.</p>
              <p className="mb-2"><strong>Preference Cookies:</strong> Remember your settings and preferences.</p>
              <p className="mb-2"><strong>Analytics Cookies:</strong> Help us understand how visitors use our site.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600 mb-4">
              You can control and manage cookies through your browser settings. However, please note 
              that disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our use of cookies, please contact us at{" "}
              <a href="mailto:luis.lozoya.tech@gmail.com" className="text-blue-600 hover:text-blue-800">
                luis.lozoya.tech@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
