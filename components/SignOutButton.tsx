"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="rounded-lg border border-line px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition hover:border-line-strong hover:text-paper"
    >
      Sign out
    </button>
  );
}
