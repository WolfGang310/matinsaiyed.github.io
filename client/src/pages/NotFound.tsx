import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black">
      <div className="w-full max-w-lg mx-4 p-8 bg-neutral-900/60 border border-neutral-800 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/20 rounded-full animate-pulse" />
            <AlertCircle className="relative h-16 w-16 text-red-600" />
          </div>
        </div>

        <h1
          className="text-5xl font-bold text-white mb-2 uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          404
        </h1>

        <h2
          className="text-xl font-semibold text-neutral-300 mb-4 uppercase tracking-wider"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page Not Found
        </h2>

        <p className="text-neutral-500 mb-8 leading-relaxed">
          Sorry, the page you are looking for doesn't exist.
          <br />
          It may have been moved or deleted.
        </p>

        <button
          onClick={() => setLocation("/")}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-medium uppercase tracking-wider text-sm overflow-hidden transition-all duration-300 hover:shadow-glow"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="relative z-10 flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </span>
          <div className="absolute inset-0 bg-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </button>
      </div>
    </div>
  );
}
