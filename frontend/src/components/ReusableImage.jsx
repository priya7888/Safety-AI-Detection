import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function ReusableImage({
  imageSrc = '/assets/images/safety-photo-1.jpg',
  alt = 'Industrial Safety Intelligence Visual',
  className = '',
  aspectRatio = 'aspect-16/10',
  badge = null,
  priority = false
}) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative group overflow-hidden rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/60 ${className}`}>
      {!loaded && !hasError && (
        <div className={`absolute inset-0 bg-slate-200 dark:bg-slate-800/60 animate-pulse flex items-center justify-center ${aspectRatio}`}>
          <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
            <Sparkles className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs font-mono uppercase tracking-wider">Loading Safety Visual...</span>
          </div>
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setHasError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />

      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-orange-500/70 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-orange-500/70 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-orange-500/70 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-orange-500/70 pointer-events-none" />

      {badge && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          {badge}
        </div>
      )}
    </div>
  );
}