"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "images";

export default function UploadButton({
  onUploaded,
}: {
  onUploaded: () => void;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setBusy(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setBusy(false);
      return;
    }

    for (const file of Array.from(files)) {
      // Name the stored object by timestamp so the key is always valid,
      // regardless of the original filename's characters.
      const ext = file.name.includes(".")
        ? "." + file.name.split(".").pop()!.toLowerCase()
        : "";
      const stamp = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const fileName = `${stamp}${ext}`;
      const path = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }

      const { error: insertError } = await supabase.from("images").insert({
        user_id: user.id,
        storage_path: path,
        file_name: fileName,
      });

      if (insertError) {
        // Roll back the orphaned file if the DB insert failed.
        await supabase.storage.from(BUCKET).remove([path]);
        setError(insertError.message);
      }
    }

    if (inputRef.current) inputRef.current.value = "";
    setBusy(false);
    onUploaded();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group inline-flex items-center gap-2.5 rounded-lg bg-ember px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:bg-[#e6b25c] disabled:opacity-60"
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full bg-ink ${
            busy ? "animate-pulse" : ""
          }`}
        />
        {busy ? "Developing…" : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      {error && <span className="font-mono text-[11px] text-danger">{error}</span>}
    </div>
  );
}
