import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* About Section */}
          <div>
            <Link href="/" className="flex items-center mb-6">
              <div className="w-48 h-48 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image 
                  src="/images/Portfolio Hub Icon.png" 
                  alt="PortfolioHub Logo" 
                  width={192} 
                  height={192}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Connect with talented professionals and showcase your work.
            </p>
            
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-6 text-sm uppercase tracking-wide">Explore</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/create-portfolio"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Create Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Browse Portfolios
                </Link>
              </li>
              <li>
                <Link
                  href="/collaborations"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Collaborations
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-white font-heading font-semibold mb-6 text-sm uppercase tracking-wide">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:luis.lozoya.tech@gmail.com"
                  className="text-gray-300 hover:text-brand-300 transition-colors duration-200 text-sm"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-xs">
              © {new Date().getFullYear()} PortfolioHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-300 text-xs">Made with</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300 text-xs">for developers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
