"use client";

import { useState } from "react";
import { updateProfile, updatePassword, updateTheme } from "@/app/actions/settings";
import { User, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Palette } from "lucide-react";

function SectionCard({ title, subtitle, icon: Icon, children }: {
  title: string; subtitle: string; icon: any; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-50">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Alert({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium mb-5 ${
      type === "success" ? "bg-emerald-50 border border-emerald-100 text-emerald-700" : "bg-red-50 border border-red-100 text-red-700"
    }`}>
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {text}
    </div>
  );
}

function InputField({ icon: Icon, ...props }: { icon: any; [key: string]: any }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon size={16} className="text-gray-400" />
      </div>
      <input
        {...props}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  );
}

export default function SettingsForm({ user }: { user: any }) {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("apex-theme") || "midnight";
    }
    return "midnight";
  });

  const THEMES = [
    { id: "midnight", name: "Midnight", color1: "#0f172a", color2: "#1e1b4b" },
    { id: "emerald", name: "Emerald", color1: "#064e3b", color2: "#022c22" },
    { id: "ocean", name: "Ocean", color1: "#082f49", color2: "#081424" },
    { id: "rose", name: "Rose", color1: "#4c0519", color2: "#28020c" },
  ];

  async function handleThemeChange(themeId: string) {
    setCurrentTheme(themeId);
    if (themeId === "midnight") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("apex-theme");
    } else {
      document.documentElement.setAttribute("data-theme", themeId);
      localStorage.setItem("apex-theme", themeId);
    }
    
    // Save to database
    try {
      await updateTheme(themeId);
    } catch (e) {
      console.error("Failed to save theme to DB", e);
    }
  }

  async function handleProfileUpdate(formData: FormData) {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await updateProfile(formData);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (e: any) {
      setProfileMsg({ type: "error", text: e.message });
    }
    setProfileLoading(false);
  }

  async function handlePasswordUpdate(formData: FormData) {
    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      await updatePassword(formData);
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      (document.getElementById("pwForm") as HTMLFormElement)?.reset();
    } catch (e: any) {
      setPasswordMsg({ type: "error", text: e.message });
    }
    setPasswordLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Profile */}
      <SectionCard title="Profile Information" subtitle="Update your name and email address" icon={User}>
        {profileMsg && <Alert type={profileMsg.type} text={profileMsg.text} />}
        <form action={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Full Name</label>
              <InputField icon={User} type="text" name="name" defaultValue={user.name || ""} required placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Email Address</label>
              <InputField icon={Mail} type="email" name="email" defaultValue={user.email || ""} required placeholder="you@school.edu" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={profileLoading}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Password */}
      <SectionCard title="Change Password" subtitle="Use a strong password to keep your account secure" icon={Lock}>
        {passwordMsg && <Alert type={passwordMsg.type} text={passwordMsg.text} />}
        <form id="pwForm" action={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Current Password</label>
            <InputField icon={Lock} type="password" name="currentPassword" required placeholder="Enter current password" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">New Password</label>
              <InputField icon={Lock} type={showPw ? "text" : "password"} name="newPassword" required placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="Repeat new password"
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl text-sm outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={passwordLoading}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 bg-slate-800 hover:bg-slate-900">
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Theme Settings */}
      <SectionCard title="Appearance" subtitle="Customize the look and feel of your portal" icon={Palette}>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Color Theme</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                type="button"
                onClick={() => handleThemeChange(theme.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  currentTheme === theme.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="w-full h-12 rounded-lg mb-2 shadow-sm" style={{ background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})` }} />
                <span className="text-sm font-semibold text-gray-700">{theme.name}</span>
                {currentTheme === theme.id && (
                  <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-0.5">
                    <CheckCircle size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
