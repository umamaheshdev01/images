"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="glow-top pointer-events-none absolute inset-0" />

      <div className="relative z-10 w-full max-w-sm animate-rise">
        <div className="mb-10 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.4em] text-ember">
            Est. Archive
          </p>
          <h1 className="font-display text-5xl font-light leading-none tracking-tight text-paper">
            Dark<span className="italic text-ember">room</span>
          </h1>
          <p className="mt-4 text-sm text-muted">
            A private place for your images.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-line bg-surface/70 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            <span className="text-paper">Entrance</span>
            <span className="h-px flex-1 bg-line" />
            <span>01</span>
          </div>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Email
            </span>
            <input
              type="email"
              required
              placeholder="you@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink/60 px-3.5 py-2.5 text-paper outline-none transition placeholder:text-muted/50 focus:border-ember/60 focus:bg-ink"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink/60 px-3.5 py-2.5 text-paper outline-none transition placeholder:text-muted/50 focus:border-ember/60 focus:bg-ink"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full overflow-hidden rounded-lg bg-ember px-4 py-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:bg-[#e6b25c] disabled:opacity-60"
          >
            {loading ? "Developing…" : "Enter →"}
          </button>

          {message && (
            <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
