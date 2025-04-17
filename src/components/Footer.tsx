import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="relative h-20 w-60 block">
              <Image
                src="/images/PortFolioHub3.png"
                alt="PortfolioHub Logo"
                fill
                className="object-contain"
              />
            </Link>
            <p className="text-gray-300 text-sm">
              Connect with talented professionals and showcase your skills to
              the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/create-portfolio"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Create Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:luis.lozoya.tech@gmail.com"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  luis.lozoya.tech@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} PortfolioHub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-300 hover:text-white text-sm transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
