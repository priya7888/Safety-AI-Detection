export default function ChartCard({ title, description, children, className = "", action }) {
  return (
    <div className={`glass-card rounded-2xl p-5 sm:p-6 flex flex-col border dark:border-white/10 border-slate-200/90 shadow-xl ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-base font-bold dark:text-white text-slate-900 tracking-tight">{title}</h3>
          {description && <p className="text-xs dark:text-slate-400 text-slate-600 mt-1 font-body leading-relaxed">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1 min-h-0 w-full">{children}</div>
    </div>
  );
}
