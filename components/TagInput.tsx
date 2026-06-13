"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TagInput({
  imageId,
  onAdded,
}: {
  imageId: string;
  onAdded: () => void;
}) {
  const supabase = createClient();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function addTag(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim().toLowerCase();
    if (!name) return;

    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return;
    }

    // Reuse the tag if it already exists for this user, otherwise create it.
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .upsert({ user_id: user.id, name }, { onConflict: "user_id,name" })
      .select("id")
      .single();

    if (tagError || !tag) {
      setBusy(false);
      return;
    }

    // Link tag to image (ignore duplicate links).
    await supabase.from("image_tags").upsert({ image_id: imageId, tag_id: tag.id });

    setValue("");
    setBusy(false);
    onAdded();
  }

  return (
    <form onSubmit={addTag} className="flex items-center gap-1.5">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="add tag…"
        className="min-w-0 flex-1 rounded-md border border-line bg-ink/60 px-2.5 py-1 font-mono text-[11px] text-paper outline-none transition placeholder:text-muted/50 focus:border-ember/50"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md border border-line px-2 py-1 font-mono text-xs text-muted transition hover:border-ember/60 hover:text-ember disabled:opacity-50"
        aria-label="Add tag"
      >
        +
      </button>
    </form>
  );
}
