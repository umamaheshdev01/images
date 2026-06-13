import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Gallery from "@/components/Gallery";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="glow-top relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-10">
      <header className="animate-rise">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.4em] text-ember">
              The Archive
            </p>
            <h1 className="font-display text-4xl font-light leading-none tracking-tight text-paper sm:text-5xl">
              Dark<span className="italic text-ember">room</span>
            </h1>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember" />
          <span className="truncate">{user.email}</span>
        </div>

        <div className="hairline mt-6" />
      </header>

      <div className="mt-10">
        <Gallery />
      </div>
    </main>
  );
}
