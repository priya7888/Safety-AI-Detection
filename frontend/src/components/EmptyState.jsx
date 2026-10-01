export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 glass-card rounded-2xl border border-white/10 my-4">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <Icon size={24} strokeWidth={2} />
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md font-body leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
