"use client";
import { useEffect, useRef, useState } from "react";

export default function Dropdown({
  label,
  children,
  align = "left",
  closeOnClick = true,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  closeOnClick?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="btn"
      >
        {label}
        <span className="ml-1 text-xs">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          onClick={() => closeOnClick && setOpen(false)}
          className={`absolute z-20 mt-1 min-w-48 rounded border border-slate-200 bg-white py-1 shadow-md ${align === "right" ? "right-0" : "left-0"}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
