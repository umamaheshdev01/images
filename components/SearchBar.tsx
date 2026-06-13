"use client";

export default function SearchBar({
  allTags,
  selected,
  onChange,
}: {
  allTags: string[];
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  if (allTags.length === 0) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted/60">
        No tags yet
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Filter
      </span>
      {allTags.map((tag) => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide transition ${
              active
                ? "border-ember bg-ember text-ink"
                : "border-line text-muted hover:border-line-strong hover:text-paper"
            }`}
          >
            {tag}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted underline-offset-4 transition hover:text-paper hover:underline"
        >
          clear
        </button>
      )}
    </div>
  );
}
