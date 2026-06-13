"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GalleryImage } from "@/lib/types";
import TagInput from "./TagInput";
import Lightbox from "./Lightbox";

const BUCKET = "images";

export default function ImageCard({
  image,
  index = 0,
  onChanged,
}: {
  image: GalleryImage;
  index?: number;
  onChanged: () => void;
}) {
  const supabase = createClient();
  const [busy, setBusy] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  async function deleteImage() {
    if (!confirm(`Delete this frame?`)) return;
    setBusy(true);
    // Remove the file; the images row (and its tag links) cascade on row delete.
    await supabase.storage.from(BUCKET).remove([image.storage_path]);
    await supabase.from("images").delete().eq("id", image.id);
    setBusy(false);
    onChanged();
  }

  async function removeTag(tagId: string) {
    await supabase
      .from("image_tags")
      .delete()
      .eq("image_id", image.id)
      .eq("tag_id", tagId);
    onChanged();
  }

  const date = new Date(image.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="group animate-rise overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-line-strong"
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink">
        {image.url ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="block h-full w-full cursor-zoom-in"
            aria-label="View full screen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.file_name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          </button>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-[11px] uppercase tracking-widest text-muted/50">
            no preview
          </div>
        )}

        {/* gradient scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-70" />

        <button
          onClick={deleteImage}
          disabled={busy}
          title="Delete"
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black/55 text-sm text-paper/80 backdrop-blur-sm transition hover:border-danger/50 hover:text-danger disabled:opacity-50 sm:h-7 sm:w-7 sm:opacity-0 sm:group-hover:opacity-100"
        >
          ✕
        </button>

        <span className="absolute bottom-2.5 left-3 font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
          {date}
        </span>
      </div>

      <div className="space-y-3 p-3.5">
        <div className="flex flex-wrap gap-1.5">
          {image.tags.length === 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/40">
              untagged
            </span>
          ) : (
            image.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-ink/50 px-2 py-0.5 font-mono text-[10px] tracking-wide text-paper/80"
              >
                {tag.name}
                <button
                  onClick={() => removeTag(tag.id)}
                  className="text-muted transition hover:text-danger"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <TagInput imageId={image.id} onAdded={onChanged} />
      </div>

      {zoomed && image.url && (
        <Lightbox
          url={image.url}
          alt={image.file_name}
          onClose={() => setZoomed(false)}
        />
      )}
    </div>
  );
}
