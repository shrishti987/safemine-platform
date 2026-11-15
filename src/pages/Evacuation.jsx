import { useState } from "react";
import {
  Route,
  Navigation,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Megaphone,
  Users,
  MapPin,
  BellRing,
} from "lucide-react";
import { useMineContext } from "../context/MineDataContext";
import EmergencyPanel from "../components/alerts/EmergencyPanel";
import Badge from "../components/common/Badge";

const bandVariant = {
  SAFE: "success",
  MODERATE: "warning",
  HIGH: "orange",
  CRITICAL: "danger",
};

const recommendedAction = {
  CRITICAL: "Evacuate the zone immediately via the nearest surface route.",
  HIGH: "Prepare for evacuation and increase monitoring frequency.",
  MODERATE: "Continue close monitoring — no evacuation required yet.",
  SAFE: "No action required. Zone is operating normally.",
};

function toEmergencyAlertShape(alert) {
  return {
    id: alert.id,
    title: alert.title,
    severity: alert.type,
    worker: alert.worker,
    zone: alert.zone,
    acknowledged: alert.acknowledged,
    status: alert.acknowledged ? "Resolved" : undefined,
  };
}

function Evacuation() {
  const { alerts, zones, workers, acknowledgeAlert } = useMineContext();
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [evacuationActive, setEvacuationActive] = useState(false);
  const [routeBroadcasted, setRouteBroadcasted] = useState(false);
  const [teamNotified, setTeamNotified] = useState(false);

  const defaultHazardZone =
    zones.find((zone) => zone.hazardDetected) ||
    zones.find((zone) => zone.band === "CRITICAL") ||
    zones.find((zone) => zone.band === "HIGH") ||
    zones.find((zone) => zone.id === "Zone C") ||
    zones[0];

  const targetZone =
    zones.find((zone) => zone.id === selectedZoneId) || defaultHazardZone;

  const zoneWorkers = workers.filter(
    (worker) => worker.zone === targetZone?.id
  );
  const affectedWorkers = zoneWorkers.filter(
    (worker) => worker.status !== "Safe"
  );
  const leadWorker = affectedWorkers[0] || zoneWorkers[0];

  const handleBroadcast = () => {
    setRouteBroadcasted(true);
    setTimeout(() => setRouteBroadcasted(false), 3000);
  };

  const handleEmergencyAction = (action) => {
    if (action === "evacuate") {
      setEvacuationActive(true);
    }
    if (action === "notify") {
      setTeamNotified(true);
      setTimeout(() => setTeamNotified(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">
          Emergency Response
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white">
          Evacuation & Emergency Response
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          AI-recommended evacuation routing and zone-level decision support.
        </p>
      </div>

      {teamNotified && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs font-medium text-emerald-300">
          <BellRing size={15} />
          Safety response team has been notified for {targetZone?.name}.
        </div>
      )}

      <EmergencyPanel
        alerts={alerts.map(toEmergencyAlertShape)}
        onAcknowledge={acknowledgeAlert}
        onEmergencyAction={handleEmergencyAction}
      />

      {/* AFFECTED ZONE SUMMARY */}
      <div
        className={`rounded-2xl border p-5 ${
          targetZone?.hazardDetected
            ? "border-red-500/20 bg-red-500/[0.04]"
            : "border-white/[0.06] bg-[#0c121c]"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-slate-300" />
            <h3 className="text-sm font-semibold text-white">
              Target Zone: {targetZone?.name || "--"} ({targetZone?.label})
            </h3>
            {targetZone && (
              <Badge variant={bandVariant[targetZone.band]} dot>
                {targetZone.band}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {zones.map((z) => (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZoneId(z.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  targetZone?.id === z.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {z.id}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
          {targetZone?.hazardReason ||
            "No active environmental hazard detected. Showing standard evacuation protocol for this zone."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
            <p className="text-[11px] uppercase text-slate-400">
              Workers in Zone
            </p>
            <p className="mt-1 text-xl font-bold text-white">
              {zoneWorkers.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
            <p className="text-[11px] uppercase text-slate-400">
              Need Attention
            </p>
            <p className="mt-1 text-xl font-bold text-amber-400">
              {affectedWorkers.length}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
            <p className="text-[11px] uppercase text-slate-400">Zone Risk</p>
            <p className="mt-1 text-xl font-bold text-white">
              {targetZone?.safetyScore ?? "--"}/100
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5">
            <p className="text-[11px] uppercase text-slate-400">Avg Gas</p>
            <p className="mt-1 text-xl font-bold text-white">
              {targetZone?.avgGas ?? "--"} ppm
            </p>
          </div>
        </div>

        {affectedWorkers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {affectedWorkers.map((worker) => (
              <span
                key={worker.id}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200"
              >
                <Users size={13} className="text-slate-400" />
                {worker.name} · {worker.status}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-cyan-400/[0.06] p-3.5">
          <ShieldAlert size={15} className="shrink-0 text-cyan-400" />
          <p className="text-xs text-slate-200">
            <span className="font-semibold text-cyan-400">
              Recommended action:
            </span>{" "}
            {recommendedAction[targetZone?.band] || recommendedAction.SAFE}
          </p>
        </div>
      </div>

      {/* ROUTE VISUALIZATION */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="relative h-[450px] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c121c]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-[10%] top-[20%] h-1 w-[75%] rotate-12 bg-slate-600" />
            <div className="absolute left-[15%] top-[55%] h-1 w-[70%] -rotate-12 bg-slate-600" />
            <div className="absolute left-[25%] top-[30%] h-[55%] w-1 rotate-[15deg] bg-slate-600" />
          </div>

          <div className="absolute left-[20%] top-[30%] flex items-center gap-2">
            <div className="rounded-full bg-red-500/20 p-3">
              <ShieldAlert className="text-red-400" size={20} />
            </div>
            <span className="rounded-md bg-[#0c121c]/90 px-2 py-1 text-xs font-medium text-red-300">
              {targetZone?.name}
            </span>
          </div>

          <div className="absolute bottom-[20%] right-[18%] flex items-center gap-2">
            <span className="rounded-md bg-[#0c121c]/90 px-2 py-1 text-xs font-medium text-emerald-300">
              Surface Gate 01
            </span>
            <div className="rounded-full bg-emerald-500/20 p-3">
              <Navigation className="text-emerald-400" size={20} />
            </div>
          </div>

          <div className="absolute left-[24%] top-[36%] h-[210px] w-[52%] rotate-[18deg] border-t-2 border-dashed border-emerald-400/70" />

          <div className="absolute bottom-5 left-5 rounded-xl border border-white/[0.08] bg-[#0c121c]/90 px-4 py-3 backdrop-blur">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Optimal Route
            </p>
            <p className="mt-1 text-base font-bold text-emerald-400">
              248 meters
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center gap-2">
            <Route size={18} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Evacuation Path
            </h3>
          </div>

          <div className="mt-6 space-y-5">
            {[
              [
                "Current Location",
                `${targetZone?.name || "--"} — ${leadWorker?.name || "Zone Crew"} (${leadWorker?.id || "N/A"})`,
              ],
              [
                "Nearest Junction",
                `Junction ${targetZone?.id?.slice(-1) || "C"}4`,
              ],
              [
                "Safe Route",
                `Tunnel ${targetZone?.id?.slice(-1) || "C"}4 → Main Shaft`,
              ],
              ["Exit", "Surface Gate 01"],
            ].map(([label, value], index) => (
              <div key={label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-bold text-emerald-400">
                    {index + 1}
                  </div>
                  {index < 3 && <div className="mt-1 h-7 w-px bg-slate-800" />}
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-xs font-medium text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 rounded-xl bg-emerald-400/[0.06] p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                Route verified & clear
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated time</span>
              <span className="font-semibold text-white">3m 12s</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEvacuationActive((current) => !current)}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition ${
              evacuationActive
                ? "bg-emerald-500 text-white hover:bg-emerald-400"
                : "bg-red-500 text-white hover:bg-red-400"
            }`}
          >
            {evacuationActive && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            )}
            {evacuationActive ? "Evacuation Active (Click to Stand Down)" : "Start Evacuation"}
          </button>

          <button
            type="button"
            onClick={handleBroadcast}
            disabled={routeBroadcasted}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-xs font-medium transition ${
              routeBroadcasted
                ? "border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-400"
                : "border-white/[0.08] text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            {routeBroadcasted ? (
              <>
                <Megaphone size={14} />
                Route Broadcasted to Helmets
              </>
            ) : (
              <>
                Broadcast Route
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Evacuation;
