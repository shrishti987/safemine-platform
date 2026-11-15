import { ChevronRight, ShieldCheck } from "lucide-react";

const defaultWorkers = [
  {
    id: "SM-001",
    name: "Arjun Singh",
    zone: "Zone A",
    risk: 1.6,
    status: "Safe",
  },
  {
    id: "SM-002",
    name: "Rohit Kumar",
    zone: "Zone B",
    risk: 1.9,
    status: "Safe",
  },
  {
    id: "SM-003",
    name: "Vikas Negi",
    zone: "Zone B",
    risk: 4.9,
    status: "Warning",
  },
  {
    id: "SM-004",
    name: "Aman Rawat",
    zone: "Zone C",
    risk: 8.6,
    status: "Critical",
  },
];

function WorkerStatus({ workers = defaultWorkers, onViewAll }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Worker Status</h3>
          <p className="mt-1 text-xs text-slate-400">Highest risk workers</p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
        >
          All workers
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="mt-5 space-y-2.5">
        {workers.map((worker) => {
          const critical = worker.status === "Critical";
          const warning = worker.status === "Warning";

          return (
            <div
              key={worker.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200">
                {worker.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {worker.name}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {worker.id} · {worker.zone}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    critical
                      ? "text-red-400"
                      : warning
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {Number(worker.risk).toFixed(1)}
                </p>
                <p className="text-[10px] text-slate-400">risk / 10</p>
              </div>

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  critical
                    ? "bg-red-400/10"
                    : warning
                      ? "bg-amber-400/10"
                      : "bg-emerald-400/10"
                }`}
              >
                <ShieldCheck
                  size={15}
                  className={
                    critical
                      ? "text-red-400"
                      : warning
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorkerStatus;