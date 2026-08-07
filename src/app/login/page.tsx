"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("superadmin@lms.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
          <div>
            <span className="text-white font-bold text-lg">ApexOrion</span>
            <div className="text-indigo-400 text-[10px] font-semibold tracking-widest uppercase">LMS</div>
          </div>
        </div>

        <div>
          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            One Portal.<br />
            <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Every Role.
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            A unified management system for administrators, teachers, and students — all in one secure platform.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: "Students", value: "∞", sub: "Managed" },
              { label: "Uptime", value: "99.9%", sub: "Guaranteed" },
              { label: "Secure", value: "256-bit", sub: "Encrypted" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-2xl border border-white/5 bg-white/3">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</div>
                <div className="text-[10px] text-indigo-400 font-semibold mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm">© {new Date().getFullYear()} ApexOrion LMS. All rights reserved.</p>
      </div>

      {/* Right panel – login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <img src="/logo.png" alt="Logo" className="w-9 h-9 rounded-xl" />
              <span className="font-bold text-gray-900">ApexOrion LMS</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to access your dashboard</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-sm">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 text-sm"
                    placeholder="admin@school.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-60"
                style={{ background: loading ? "#6366f1" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : <LogIn size={16} />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <Lock size={12} /> Secure access powered by ApexOrion LMS — All sessions are encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
