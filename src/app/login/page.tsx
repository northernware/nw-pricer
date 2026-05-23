"use client";

import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("password", password);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        // Full navigation so the session cookie is sent on the next request
        window.location.href = "/admin";
        return;
      }

      setError("Login failed. Try again.");
    } catch {
      setError("Login failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nw-bone text-nw-black flex flex-col items-center justify-center font-body selection-acid p-4 relative">
      <div className="bg-noise z-0"></div>
      
      <div className="z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="font-display font-black text-3xl uppercase tracking-tighter text-nw-black mb-1">
            NORTHERNWARE
          </div>
          <div className="font-mono text-[10px] tracking-widest text-nw-graphite uppercase">
            Restricted CRM Access
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-nw-bone border border-nw-black p-6 shadow-[4px_4px_0_0_#0a0a0a]">
          <div className="mb-4">
            <label className="block font-mono text-[10px] uppercase tracking-widest mb-2 text-nw-graphite">
              Admin Passcode
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-nw-bone border-b border-nw-graphite/30 pb-2 font-mono text-sm focus:outline-none focus:border-nw-acid text-nw-black transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-xs font-mono text-red-500 uppercase tracking-wider">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nw-black text-nw-bone font-mono text-xs uppercase tracking-widest py-3 border border-nw-black hover:bg-nw-acid hover:text-nw-black hover:shadow-[2px_2px_0_0_#0a0a0a] transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Access System"}
          </button>
        </form>
      </div>
    </div>
  );
}
