import {
  Activity,
  Battery,
  Clock3,
  MapPin,
  Radio,
  ShieldCheck,
  Thermometer,
  User,
  Wind,
  X,
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

function Metric({ icon: Icon, label, value, unit = "", status }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
        <Icon size={12} />
        {label}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-base font-bold text-white">
          {value ?? "--"}
        </span>
        {unit && <span className="text-xs text-slate-400">{unit}</span>}
      </div>

      {status && <p className="mt-1 text-[11px] text-slate-400">{status}</p>}
    </div>
  );
}

function WorkerDetails({ worker, onClose, onAcknowledge }) {
  if (!worker) {
    return null;
  }

  const status = worker.status || "Safe";
  const config = statusConfig[status] || statusConfig.Safe;
  const riskScore = Number(worker.riskScore) || 0;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0c121c] shadow-xl">
      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-white/[0.05] p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#111925]">
            {worker.avatar ? (
              <img
                src={worker.avatar}
                alt={worker.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={20} className="text-slate-400" />
            )}
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              {worker.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {worker.role || "Mining Operator"}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${config.bg} ${config.border} ${config.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                {status}
              </span>

              <span className="text-xs text-slate-400">{worker.id}</span>
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
            aria-label="Close worker details"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* BASIC INFORMATION */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <MapPin size={12} />
            Zone
          </div>
          <p className="mt-1.5 text-xs font-semibold text-white">
            {worker.zone || "--"}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Radio size={12} />
            Helmet
          </div>
          <p className="mt-1.5 text-xs font-semibold text-white">
            {worker.helmetId || "--"}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock3 size={12} />
            Last Seen
          </div>
          <p className="mt-1.5 text-xs font-semibold text-white">
            {worker.lastSeen || "Just now"}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={12} />
            Risk
          </div>
          <p
            className={`mt-1.5 text-xs font-bold ${
              riskScore >= 8
                ? "text-red-400"
                : riskScore >= 4
                  ? "text-amber-400"
                  : "text-emerald-400"
            }`}
          >
            {riskScore.toFixed(1)} / 10
          </p>
        </div>
      </div>

      {/* SENSOR READINGS */}
      <div className="border-t border-white/[0.05] p-5">
        <div className="mb-3">
          <h3 className="text-xs font-semibold text-white">
            Live Sensor Readings
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Current readings from the worker&apos;s safety helmet
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric
            icon={Thermometer}
            label="Temperature"
            value={worker.temperature}
            unit="°C"
            status={worker.temperature > 38 ? "Above threshold" : "Normal range"}
          />

          <Metric
            icon={Wind}
            label="Gas Level"
            value={worker.gas}
            unit="ppm"
            status={worker.gas > 50 ? "Unsafe concentration" : "Normal range"}
          />

          <Metric
            icon={Activity}
            label="Motion"
            value={worker.motion}
            unit="g"
            status={worker.motion > 0.5 ? "Abnormal motion" : "Normal activity"}
          />

          <Metric
            icon={Battery}
            label="Battery"
            value={worker.battery}
            unit="%"
            status={worker.battery < 30 ? "Low battery" : "Battery healthy"}
          />
        </div>
      </div>

      {/* CONNECTIVITY */}
      <div className="border-t border-white/[0.05] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-white">Connectivity</h3>
            <p className="mt-0.5 text-[11px] text-slate-400">
              LoRa helmet connection quality
            </p>
          </div>

          <Radio
            size={15}
            className={worker.signal < 70 ? "text-amber-400" : "text-emerald-400"}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={`h-full rounded-full ${
                worker.signal < 70 ? "bg-amber-400" : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(worker.signal ?? 0, 100)}%` }}
            />
          </div>

          <span className="text-xs font-semibold text-slate-300">
            {worker.signal ?? "--"}%
          </span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-2 border-t border-white/[0.05] p-5">
        {status !== "Safe" && onAcknowledge && (
          <button
            type="button"
            onClick={() => onAcknowledge(worker)}
            className="rounded-xl border border-amber-400/20 bg-amber-400/[0.08] px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-400/15"
          >
            Acknowledge Alert
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkerDetails;