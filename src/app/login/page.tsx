"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        toast.error(data.details ? `${data.error}: ${data.details}` : (data.error || "Invalid credentials"));
      }
    } catch (error) {
      toast.error("Network error or server unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-nw-bone flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-nw-acid/5 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-nw-acid/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }}></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-nw-white border-t-4 border-nw-acid p-10 shadow-2xl relative overflow-hidden">
          {/* Logo */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-display font-bold track-tighter m-0 text-nw-black">
              northernware<span className="text-nw-acid text-xl align-super ml-1">®</span>
            </h1>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-nw-graphite mt-2">
              Pricing Engine Access
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite font-bold">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nw-graphite/40">
                  <Icon icon="solar:user-linear" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-nw-bone/50 border border-nw-graphite/10 px-10 py-4 text-sm focus:outline-none focus:border-nw-acid transition-all"
                  placeholder="admin@northernware.ph"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-nw-graphite font-bold">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nw-graphite/40">
                  <Icon icon="solar:lock-password-linear" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-nw-bone/50 border border-nw-graphite/10 px-10 py-4 text-sm focus:outline-none focus:border-nw-acid transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-nw-black text-nw-bone py-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-nw-acid transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Icon icon="solar:refresh-linear" className="animate-spin text-lg" />
              ) : (
                <>
                  Authenticate
                  <Icon icon="solar:arrow-right-linear" className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-nw-graphite/10 text-center">
            <p className="text-[10px] font-mono text-nw-graphite uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-nw-graphite/40 font-mono text-[9px] uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Northernware Software Development Services
        </p>
      </div>
    </div>
  );
}
