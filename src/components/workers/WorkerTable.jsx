import {
  Activity,
  ArrowDown,
  ArrowUp,
  Battery,
  ChevronRight,
  MapPin,
  Radio,
  Search,
  ShieldCheck,
  Thermometer,
  User,
  Wind,
} from "lucide-react";

const statusConfig = {
  Safe: {
    text: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    dot: "bg-emerald-400",
  },
  Warning: {
    text: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    dot: "bg-amber-400",
  },
  Critical: {
    text: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    dot: "bg-red-400",
  },
  Offline: {
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-500",
  },
};

function SortIcon({ active, direction }) {
  if (!active) {
    return <span className="text-slate-500">↕</span>;
  }

  return direction === "asc" ? (
    <ArrowUp size={12} className="text-cyan-400" />
  ) : (
    <ArrowDown size={12} className="text-cyan-400" />
  );
}

function WorkerTable({
  workers = [],
  onWorkerClick,
  searchTerm = "",
  onSearchChange,
  statusFilter = "All",
  onStatusChange,
  sortBy = "name",
  sortDirection = "asc",
  onSort,
}) {
  const filteredWorkers = workers
    .filter((worker) => {
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        !query ||
        worker.name?.toLowerCase().includes(query) ||
        worker.id?.toLowerCase().includes(query) ||
        worker.helmetId?.toLowerCase().includes(query) ||
        worker.zone?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || worker.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let first = a[sortBy];
      let second = b[sortBy];

      if (typeof first === "string") {
        first = first.toLowerCase();
        second = second?.toLowerCase();
      }

      if (first < second) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (first > second) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c121c]">
      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 border-b border-white/[0.05] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Mine Personnel</h2>
          <p className="mt-1 text-xs text-slate-400">
            Click any worker row to inspect detailed live helmet telemetry
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {onSearchChange && (
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search worker..."
                className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/30 sm:w-56"
              />
            </div>
          )}

          {onStatusChange && (
            <select
              value={statusFilter}
              onChange={(event) => onStatusChange(event.target.value)}
              className="h-9 rounded-xl border border-white/[0.08] bg-[#101722] px-3 text-xs text-slate-200 outline-none focus:border-cyan-400/30"
            >
              <option value="All">All Status</option>
              <option value="Safe">Safe</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
              <option value="Offline">Offline</option>
            </select>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSort?.("name")}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
                >
                  Worker
                  <SortIcon active={sortBy === "name"} direction={sortDirection} />
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSort?.("zone")}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
                >
                  Zone
                  <SortIcon active={sortBy === "zone"} direction={sortDirection} />
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Helmet
                </span>
              </th>

              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSort?.("riskScore")}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white"
                >
                  Risk
                  <SortIcon
                    active={sortBy === "riskScore"}
                    direction={sortDirection}
                  />
                </button>
              </th>

              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Sensors (Temp / Gas / Motion)
                </span>
              </th>

              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Battery
                </span>
              </th>

              <th className="px-4 py-3 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </span>
              </th>

              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody>
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <User size={22} className="text-slate-500" />
                    <p className="mt-3 text-xs font-medium text-slate-300">
                      No workers found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or status filter.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredWorkers.map((worker) => {
                const status = worker.status || "Safe";
                const style = statusConfig[status] || statusConfig.Safe;
                const risk = Number(worker.riskScore) || 0;

                return (
                  <tr
                    key={worker.id}
                    onClick={() => onWorkerClick?.(worker)}
                    className={`border-b border-white/[0.04] transition last:border-b-0 ${
                      onWorkerClick ? "cursor-pointer hover:bg-white/[0.03]" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-[#111925]">
                          {worker.avatar ? (
                            <img
                              src={worker.avatar}
                              alt={worker.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User size={15} className="text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-white">
                            {worker.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {worker.id} · {worker.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-300">
                          {worker.zone || "--"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Radio size={12} className="text-slate-400" />
                        <span className="font-mono text-xs text-slate-300">
                          {worker.helmetId || "--"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="w-24">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              risk >= 8
                                ? "text-red-400"
                                : risk >= 4
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                            }`}
                          >
                            {risk.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-400">/10</span>
                        </div>

                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className={`h-full rounded-full ${
                              risk >= 8
                                ? "bg-red-400"
                                : risk >= 4
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                            }`}
                            style={{ width: `${Math.min(risk * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span title="Temperature" className="flex items-center gap-1">
                          <Thermometer size={12} className="text-orange-400" />
                          {worker.temperature ?? "--"}°
                        </span>
                        <span title="Gas" className="flex items-center gap-1">
                          <Wind size={12} className="text-cyan-400" />
                          {worker.gas ?? "--"}
                        </span>
                        <span title="Motion" className="flex items-center gap-1">
                          <Activity size={12} className="text-violet-400" />
                          {worker.motion ?? "--"}g
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Battery
                          size={13}
                          className={
                            worker.battery < 30 ? "text-red-400" : "text-slate-400"
                          }
                        />
                        <span
                          className={`text-xs font-medium ${
                            worker.battery < 30 ? "text-red-400" : "text-slate-300"
                          }`}
                        >
                          {worker.battery ?? "--"}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${style.bg} ${style.border} ${style.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {onWorkerClick && (
                        <ChevronRight
                          size={15}
                          className="ml-auto text-slate-500"
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-3">
        <span className="text-xs text-slate-400">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredWorkers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white">{workers.length}</span>{" "}
          workers
        </span>

        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span className="text-xs text-slate-400">
            Safety monitoring active
          </span>
        </div>
      </div>
    </div>
  );
}

export default WorkerTable;