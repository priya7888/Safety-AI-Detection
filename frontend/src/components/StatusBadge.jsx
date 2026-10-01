import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function StatusBadge({ sifPotential, size = "md", showGlow = true }) {
  const isSif = Boolean(sifPotential);
  const sizing = size === "sm" ? "text-xs px-2.5 py-0.5 gap-1.5" : "text-xs sm:text-sm px-3.5 py-1.5 gap-2";
  const iconSize = size === "sm" ? 13 : 15;

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-bold tracking-wide border transition-all ${sizing} ${
        isSif
          ? `bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/40 ${showGlow ? "shadow-[0_0_20px_rgba(244,63,94,0.3)] text-glow-rose" : ""}`
          : `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 ${showGlow ? "shadow-[0_0_20px_rgba(16,185,129,0.3)] text-glow-emerald" : ""}`
      }`}
    >
      {isSif ? (
        <AlertTriangle size={iconSize} strokeWidth={2.5} className="animate-pulse" />
      ) : (
        <CheckCircle2 size={iconSize} strokeWidth={2.5} />
      )}
      <span>{isSif ? "SIF POTENTIAL: YES" : "NON-SIF (ROUTINE)"}</span>
    </span>
  );
}
