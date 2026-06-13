"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GalleryImage, Tag } from "@/lib/types";
import UploadButton from "./UploadButton";
import SearchBar from "./SearchBar";
import ImageCard from "./ImageCard";

export default function Gallery() {
  const supabase = useMemo(() => createClient(), []);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    setError(null);
    const { data, error } = await supabase
      .from("images")
      .select(
        "id, storage_path, file_name, created_at, image_tags(tags(id, name))"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const rows = data ?? [];

    // Serve every image through our own auth-gated proxy route. No public or
    // signed Supabase URL is ever exposed to the client.
    const mapped: GalleryImage[] = rows.map((r) => ({
      id: r.id,
      storage_path: r.storage_path,
      file_name: r.file_name,
      created_at: r.created_at,
      url: `/api/image/${r.id}`,
      tags: (r.image_tags ?? [])
        .map((it: any) => it.tags)
        .filter(Boolean) as Tag[],
    }));

    setImages(mapped);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const allTagNames = useMemo(() => {
    const set = new Set<string>();
    images.forEach((img) => img.tags.forEach((t) => set.add(t.name)));
    return [...set].sort();
  }, [images]);

  // An image matches if it has ANY of the selected tags.
  const visible = useMemo(() => {
    if (selectedTags.length === 0) return images;
    return images.filter((img) =>
      img.tags.some((t) => selectedTags.includes(t.name))
    );
  }, [images, selectedTags]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <UploadButton onUploaded={loadImages} />
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            {images.length} {images.length === 1 ? "frame" : "frames"}
          </div>
        </div>
        <SearchBar
          allTags={allTagNames}
          selected={selectedTags}
          onChange={setSelectedTags}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 font-mono text-xs text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-xl border border-line bg-surface"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-24 text-center">
          <p className="font-display text-2xl italic text-paper/90">
            {images.length === 0 ? "The archive is empty" : "Nothing matches"}
          </p>
          <p className="mt-2 max-w-xs font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            {images.length === 0
              ? "Upload your first frame to begin"
              : "Try clearing the active filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((img, i) => (
            <ImageCard
              key={img.id}
              image={img}
              index={i}
              onChanged={loadImages}
            />
          ))}
        </div>
      )}
    </div>
  );
}
