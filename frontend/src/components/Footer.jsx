import React from 'react';
import { GitCommit } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050507] text-slate-400 border-t border-slate-900/80 py-6">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
        <GitCommit className="w-4 h-4 text-amber-500" />
        <span>Made with commits</span>
      </div>
    </footer>
  );
}