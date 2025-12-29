"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Sign in failed", { description: "Check your credentials and try again." });
        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) throw new Error("Unable to fetch session after sign in");
      const sessionData = await sessionRes.json();
      const userRole = sessionData?.user?.role;

      if (userRole === "system_admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/agency/dashboard");
      }
      toast.success("Signed in");
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("Sign in error", { description: (err as any)?.message || "Unexpected error" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Animated Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent animate-slide-right"></div>
        <div className="absolute bottom-1/4 right-0 w-full h-px bg-gradient-to-l from-transparent via-purple-500/30 to-transparent animate-slide-left"></div>
      </div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center relative z-10">
        {/* Left Section - Animated Content */}
        <div className="flex-1 space-y-6 animate-slide-in-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur-sm animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Sterling Portal · Secure Access
          </div>
          
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl animate-fade-in-up">
            Sign in to manage 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              quotes, policies, and binds.
            </span>
          </h1>
          
          <p className="max-w-2xl text-lg text-slate-200/80 animate-fade-in-up animation-delay-200">
            Centralize your agency and admin workflows—quotes, e-sign, payments, and bind approvals—all in one secure place.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { text: "Role-aware dashboards", delay: "300" },
              { text: "Status timelines", delay: "400" },
              { text: "Secure e-sign & payments", delay: "500" },
              { text: "Real-time updates", delay: "600" }
            ].map((item, idx) => (
              <div
                key={item.text}
                className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm hover:bg-white/10 hover:ring-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${item.delay}ms` }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold animate-bounce-subtle">
                  ✓
                </span>
                <p className="text-sm text-slate-100/90">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Animated Stats */}
          <div className="flex gap-8 pt-6 animate-fade-in-up animation-delay-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-white animate-count-up">500+</div>
              <div className="text-sm text-slate-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white animate-count-up animation-delay-100">10k+</div>
              <div className="text-sm text-slate-400">Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white animate-count-up animation-delay-200">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form with Animations */}
        <div className="w-full max-w-lg animate-slide-in-right">
          <div className="rounded-2xl bg-white/5 p-8 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl hover:ring-white/20 transition-all duration-500 hover:shadow-indigo-500/20 animate-scale-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300 animate-fade-in">Welcome back</p>
                <h2 className="text-2xl font-semibold text-white animate-fade-in animation-delay-100">Sign in</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg animate-spin-slow-once">
                <span className="animate-fade-in">SP</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 animate-fade-in-up animation-delay-200">
                <label className="block text-sm font-medium text-slate-200" htmlFor="email">
                  Email address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 transition-all duration-300 hover:border-white/20"
                    placeholder="you@example.com"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>

              <div className="space-y-2 animate-fade-in-up animation-delay-300">
                <label className="block text-sm font-medium text-slate-200" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 transition-all duration-300 hover:border-white/20"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-300/50 bg-red-500/10 px-3 py-2 text-sm text-red-100 animate-shake">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">⚠</span>
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/50 active:scale-[0.98] animate-fade-in-up animation-delay-400"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
              </button>
            </form>

            {/* Test Credentials */}
            <div className="mt-6 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4 text-xs text-slate-200 backdrop-blur-sm animate-fade-in-up animation-delay-500 hover:border-white/20 transition-all duration-300">
              <p className="text-slate-300 font-semibold flex items-center gap-2">
                <span className="text-indigo-400">ℹ</span>
                Test credentials (examples)
              </p>
              <p className="hover:text-white transition-colors">Agency Admin: admin@agency1.com / password123</p>
              <p className="hover:text-white transition-colors">Agency User: user@agency1.com / password123</p>
              <p className="hover:text-white transition-colors">System Admin: admin@sterling.com / password123</p>
              <p className="text-slate-400 hover:text-slate-300 transition-colors">Dev backdoor: admin@demo.com / Admin123!</p>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-xs text-slate-300 animate-fade-in-up animation-delay-600">
              <Link href="/" className="hover:text-white transition-all duration-300 hover:translate-x-[-2px] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-500">Secure · Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(20px) translateX(-10px); }
          50% { transform: translateY(10px) translateX(10px); }
          75% { transform: translateY(30px) translateX(-5px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes slide-left {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes slide-in-left {
          0% { opacity: 0; transform: translateX(-50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(50px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes spin-slow-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes count-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-slide-right { animation: slide-right 8s linear infinite; }
        .animate-slide-left { animation: slide-left 10s linear infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.6s ease-out; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-spin-slow-once { animation: spin-slow-once 2s ease-out; }
        .animate-count-up { animation: count-up 0.8s ease-out; }

        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-700 { animation-delay: 700ms; }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
