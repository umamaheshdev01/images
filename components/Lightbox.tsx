"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Lightbox({
  url,
  alt,
  onClose,
}: {
  url: string;
  alt: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!mounted) return null;

  // Portal to <body> so the overlay isn't trapped by any transformed ancestor
  // (e.g. the card's reveal animation leaves a transform = new containing block).
  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="animate-fade fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-3 backdrop-blur-md sm:p-8"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/80 text-paper transition hover:border-ember/60 hover:text-ember sm:right-6 sm:top-6"
      >
        ✕
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full select-none rounded-lg object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
      />
    </div>,
    document.body
  );
}
