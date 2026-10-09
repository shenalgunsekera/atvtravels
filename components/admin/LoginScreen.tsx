"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { inputBase } from "./ui";
import { cn } from "@/lib/utils";

export default function LoginScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error ?? "Couldn't sign in.");
    setLoading(false);
  }

  return (
    <div className="admin-ui relative flex min-h-dvh items-center justify-center overflow-hidden bg-navy px-4">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, #C9A84C 1.5px, transparent 1.5px)", backgroundSize: "28px 28px" }}
      />
      <form onSubmit={submit} className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-[popIn_.25s_ease]">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy font-serif text-sm font-bold text-gold">ATV</span>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin panel</h1>
            <p className="text-xs text-gray-500">ATV Travels website</p>
          </div>
        </div>

        <label htmlFor="pw" className="mb-1.5 block text-[13px] font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="pw"
            autoFocus
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter admin password"
            autoComplete="current-password"
            className={cn(inputBase, "h-11 pl-9 pr-10", error && "border-red-300 focus:border-red-400 focus:ring-red-100")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:opacity-60"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Sign in
        </button>
        <p className="mt-5 text-center text-[11px] text-gray-400">You&apos;ll stay signed in for 12 hours on this device.</p>
      </form>
    </div>
  );
}
