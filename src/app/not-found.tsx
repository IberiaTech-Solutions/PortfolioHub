import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-8xl font-display font-bold text-white/10 mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-xl"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
