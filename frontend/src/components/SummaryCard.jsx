export default function SummaryCard({
  label,
  value,
  sublabel,
  accent = "blue", // "blue" | "green" | "amber" | "purple"
  icon: Icon,
}) {
  const accentConfigs = {
    blue: {
      border: "dark:border-blue-500/30 border-blue-200",
      bgHover: "hover:dark:border-blue-500/50 hover:border-blue-300",
      valueColor: "dark:text-white text-slate-900",
      iconBg: "dark:bg-blue-500/10 bg-blue-50 text-blue-500 dark:text-blue-400 border dark:border-blue-500/20 border-blue-200",
      dot: "bg-blue-500",
      barColor: "bg-blue-500",
    },
    green: {
      border: "dark:border-emerald-500/30 border-emerald-200",
      bgHover: "hover:dark:border-emerald-500/50 hover:border-emerald-300",
      valueColor: "dark:text-white text-slate-900",
      iconBg: "dark:bg-emerald-500/10 bg-emerald-50 text-emerald-600 dark:text-emerald-400 border dark:border-emerald-500/20 border-emerald-200",
      dot: "bg-emerald-500",
      barColor: "bg-emerald-500",
    },
    amber: {
      border: "dark:border-amber-500/30 border-amber-200",
      bgHover: "hover:dark:border-amber-500/50 hover:border-amber-300",
      valueColor: "dark:text-white text-slate-900",
      iconBg: "dark:bg-amber-500/10 bg-amber-50 text-amber-600 dark:text-amber-400 border dark:border-amber-500/20 border-amber-200",
      dot: "bg-amber-500",
      barColor: "bg-amber-500",
    },
    purple: {
      border: "dark:border-purple-500/30 border-purple-200",
      bgHover: "hover:dark:border-purple-500/50 hover:border-purple-300",
      valueColor: "dark:text-white text-slate-900",
      iconBg: "dark:bg-purple-500/10 bg-purple-50 text-purple-600 dark:text-purple-400 border dark:border-purple-500/20 border-purple-200",
      dot: "bg-purple-500",
      barColor: "bg-purple-500",
    },
  };

  const config = accentConfigs[accent] || accentConfigs.blue;

  return (
    <div
      className={`rounded-2xl p-5 dark:bg-[#0d121f] bg-white border ${config.border} ${config.bgHover} shadow-sm transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500">
          {label}
        </span>
        {Icon && (
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.iconBg}`}>
            <Icon size={16} strokeWidth={2.2} />
          </span>
        )}
      </div>

      <div className="my-2.5">
        <div className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${config.valueColor}`}>
          {value ?? 0}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t dark:border-slate-800/80 border-slate-100">
        <span className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} />
        <span className="truncate">{sublabel}</span>
      </div>
    </div>
  );
}
