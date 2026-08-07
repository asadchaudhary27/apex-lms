import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import SettingsForm from "./SettingsForm";
import { redirect } from "next/navigation";
import { Shield, User, Bell } from "lucide-react";



export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return redirect("/login");

  return (
    <div className="max-w-3xl space-y-6 fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" }}>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Shield size={80} className="text-white" />
        </div>
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-xl"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-indigo-300 text-sm">{user.email}</p>
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/30">
            {user.role.replace("_", " ")}
          </span>
        </div>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}
