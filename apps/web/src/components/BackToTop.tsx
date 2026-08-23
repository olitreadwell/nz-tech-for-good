"use client";

import { useState, useEffect } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    // Scroll progress
    const bar = document.getElementById("scroll-progress");
    const onProgress = () => {
      if (!bar) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width =
        h > 0 ? `${Math.round((window.scrollY / h) * 100)}%` : "0";
    };
    window.addEventListener("scroll", onProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onProgress);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 rounded-full border border-border bg-surface p-3 shadow-lg hover:bg-surface-alt"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
