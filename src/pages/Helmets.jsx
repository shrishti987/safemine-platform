import { useMemo, useState } from "react";
import {
  HardHat,
  BatteryMedium,
  Wifi,
  WifiOff,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  Wind,
  Activity,
  Search,
} from "lucide-react";
import { useMineContext } from "../context/MineDataContext";

const statusFilters = ["All", "Active", "Warning", "Critical"];

function Helmets() {
  const { workers } = useMineContext();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const helmets = useMemo(
    () =>
      workers.map((worker) => ({
        id: worker.helmetId,
        worker: worker.name,
        workerId: worker.id,
        zone: worker.zone,
        battery: Math.round(Number(worker.battery || 0)),
        signalPercent: Math.round(Number(worker.signal || 0)),
        signal:
          worker.signal >= 90
            ? "Excellent"
            : worker.signal >= 70
              ? "Good"
              : "Weak",
        status: worker.status === "Safe" ? "Active" : worker.status,
        temperature: `${Number(worker.temperature || 0).toFixed(1)}°C`,
        gas: `${Number(worker.gas || 0).toFixed(1)} ppm`,
        motion: `${Number(worker.motion || 0).toFixed(2)}g`,
      })),
    [workers]
  );

  const lowBatteryCount = helmets.filter((h) => h.battery < 30).length;
  const alertCount = helmets.filter((h) => h.status !== "Active").length;
  const connectedCount = helmets.filter((h) => h.signalPercent > 0).length;

  const filteredHelmets = useMemo(() => {
    const search = query.trim().toLowerCase();
    return helmets.filter((helmet) => {
      const matchesStatus =
        statusFilter === "All" || helmet.status === statusFilter;
      const matchesSearch =
        !search ||
        helmet.id.toLowerCase().includes(search) ||
        helmet.worker.toLowerCase().includes(search) ||
        helmet.workerId.toLowerCase().includes(search) ||
        helmet.zone.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [helmets, query, statusFilter]);

  return (
    <div className="mx-auto max-w-[1700px] space-y-5">
      {/* HEADER */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
          IoT Hardware
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">Smart Helmets</h1>
        <p className="mt-1 text-xs text-slate-400">
          Monitor connected safety helmets, live sensors, battery health, and LoRa signal strength.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Total Helmets
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
              <HardHat size={18} className="text-cyan-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{helmets.length}</p>
          <p className="mt-1 text-xs text-slate-400">Active shift units</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Connected
            </p>
            <Wifi size={18} className="text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-400">
            {connectedCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {helmets.length > 0
              ? `${Math.round((connectedCount / helmets.length) * 100)}% online rate`
              : "0% online"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Low Battery
            </p>
            <BatteryMedium size={18} className="text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-400">
            {lowBatteryCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Below 30% charge</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Device Alerts
            </p>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-red-400">{alertCount}</p>
          <p className="mt-1 text-xs text-slate-400">Require attention</p>
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0c121c] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search helmet ID, worker, or zone..."
            className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === filter
                  ? "bg-cyan-400/15 text-cyan-300"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* HELMET GRID */}
      {filteredHelmets.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-8 text-center text-xs text-slate-400">
          No helmets match your search or filter.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredHelmets.map((helmet) => {
          const critical = helmet.status === "Critical";
          const warning = helmet.status === "Warning";

          return (
            <div
              key={helmet.id}
              className={`rounded-2xl border bg-[#0c121c] p-5 ${
                critical
                  ? "border-red-500/25"
                  : warning
                    ? "border-amber-500/20"
                    : "border-white/[0.06]"
              }`}
            >
              {/* CARD HEADER */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      critical
                        ? "bg-red-400/10"
                        : warning
                          ? "bg-amber-400/10"
                          : "bg-cyan-400/10"
                    }`}
                  >
                    <HardHat
                      size={21}
                      className={
                        critical
                          ? "text-red-400"
                          : warning
                            ? "text-amber-400"
                            : "text-cyan-400"
                      }
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {helmet.id}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {helmet.workerId}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    critical
                      ? "bg-red-400/15 text-red-400"
                      : warning
                        ? "bg-amber-400/15 text-amber-400"
                        : "bg-emerald-400/15 text-emerald-400"
                  }`}
                >
                  {helmet.status}
                </span>
              </div>

              {/* WORKER */}
              <div className="mt-5 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Assigned Worker
                </p>

                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">
                    {helmet.worker}
                  </p>
                  <span className="text-xs text-slate-400">{helmet.zone}</span>
                </div>
              </div>

              {/* SENSOR DATA */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <Thermometer size={14} className="text-orange-400" />
                  <p className="mt-2 text-[11px] text-slate-400">Temp</p>
                  <p className="mt-0.5 text-xs font-bold text-white">
                    {helmet.temperature}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <Wind size={14} className="text-cyan-400" />
                  <p className="mt-2 text-[11px] text-slate-400">Gas</p>
                  <p className="mt-0.5 text-xs font-bold text-white">
                    {helmet.gas}
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <Activity size={14} className="text-violet-400" />
                  <p className="mt-2 text-[11px] text-slate-400">Motion</p>
                  <p className="mt-0.5 text-xs font-bold text-white">
                    {helmet.motion}
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
                <div className="flex items-center gap-2">
                  {helmet.signal === "Weak" ? (
                    <WifiOff size={14} className="text-amber-400" />
                  ) : (
                    <Wifi size={14} className="text-emerald-400" />
                  )}

                  <div>
                    <p className="text-[10px] text-slate-400">Signal</p>
                    <p className="text-xs font-medium text-white">
                      {helmet.signal} ({helmet.signalPercent}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BatteryMedium
                    size={15}
                    className={
                      helmet.battery < 30
                        ? "text-red-400"
                        : helmet.battery < 50
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  />

                  <div>
                    <p className="text-[10px] text-slate-400">Battery</p>
                    <p className="text-xs font-medium text-white">
                      {helmet.battery}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <ShieldCheck
                    size={14}
                    className={
                      critical
                        ? "text-red-400"
                        : warning
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }
                  />
                  <span
                    className={`text-xs font-medium ${
                      critical
                        ? "text-red-400"
                        : warning
                          ? "text-amber-400"
                          : "text-emerald-400"
                    }`}
                  >
                    {critical ? "Alert" : warning ? "Watch" : "Protected"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Helmets;