import { Loader2 } from "lucide-react";

export default function LoadingState({ label = "Loading intelligence..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative w-12 h-12 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 animate-ping" />
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
      <p className="text-xs font-mono uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
