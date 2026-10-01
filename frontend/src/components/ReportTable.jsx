import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { ChevronRight } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ReportTable({ reports }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-2xl border dark:border-white/10 border-slate-200/90 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto scrollbar-cyber">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b dark:border-white/[0.08] border-slate-200/80 dark:bg-white/[0.02] bg-slate-50 text-slate-500 font-mono text-[11px] uppercase tracking-wider font-semibold">
              <th className="px-5 py-4">ID</th>
              <th className="px-5 py-4 min-w-[280px]">Report Narrative</th>
              <th className="px-5 py-4">Classification</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Facility / Site</th>
              <th className="px-5 py-4">Life-Saving Rule</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-4 py-4 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/[0.04] divide-slate-100">
            {reports.map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/reports/${r.id}`)}
                className="group hover:dark:bg-white/[0.04] hover:bg-slate-50 cursor-pointer transition-all"
              >
                <td className="px-5 py-4 font-mono text-xs dark:text-slate-400 text-slate-500 group-hover:text-rose-500 transition-colors font-bold">
                  #{r.id}
                </td>
                <td className="px-5 py-4 dark:text-slate-200 text-slate-800 group-hover:text-rose-500 dark:group-hover:text-white transition-colors max-w-sm">
                  <p className="truncate font-body text-xs sm:text-sm font-medium">{r.report_text}</p>
                  {r.barrier_failure && (
                    <span className="text-[10px] font-mono text-rose-500 font-medium block mt-1">
                      Barrier: {r.barrier_failure}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge sifPotential={r.sif_potential} size="sm" />
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-xs dark:text-slate-400 text-slate-500 font-mono">
                  {r.report_type}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-xs dark:text-slate-300 text-slate-700 font-medium">
                  {r.site || <span className="text-slate-400">—</span>}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  {r.life_saving_rules?.length ? (
                    <span className="inline-block text-[11px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-500/30 font-semibold shadow-xs">
                      {r.life_saving_rules[0]}
                      {r.life_saving_rules.length > 1 ? ` +${r.life_saving_rules.length - 1}` : ""}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs font-mono">—</span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-xs font-mono dark:text-slate-400 text-slate-500">
                  {formatDate(r.created_at)}
                </td>
                <td className="px-4 py-4 text-slate-400 group-hover:text-rose-500 transition-colors text-right">
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
