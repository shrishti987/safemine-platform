import { useState } from "react";
import {
  WifiOff,
  Radio,
  Activity,
  Server,
  Router,
  Signal,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ArrowDown,
  ArrowUp,
} from "lucide-react";

const initialNodes = [
  {
    id: "GW-001",
    name: "Gateway Alpha",
    location: "Zone A",
    type: "Gateway",
    status: "Online",
    signal: 96,
    latencyMs: 18,
    uptime: "99.98%",
    devices: 3,
    download: "8.4 Mbps",
    upload: "2.1 Mbps",
  },
  {
    id: "GW-002",
    name: "Gateway Beta",
    location: "Zone B",
    type: "Gateway",
    status: "Online",
    signal: 91,
    latencyMs: 24,
    uptime: "99.91%",
    devices: 3,
    download: "7.8 Mbps",
    upload: "1.9 Mbps",
  },
  {
    id: "GW-003",
    name: "Gateway Gamma",
    location: "Zone C",
    type: "Gateway",
    status: "Warning",
    signal: 67,
    latencyMs: 82,
    uptime: "98.74%",
    devices: 2,
    download: "4.2 Mbps",
    upload: "1.1 Mbps",
  },
  {
    id: "GW-004",
    name: "Gateway Delta",
    location: "Zone D (Reserve)",
    type: "Gateway",
    status: "Offline",
    signal: 0,
    latencyMs: null,
    uptime: "96.12%",
    devices: 0,
    download: "--",
    upload: "--",
  },
];

function Network() {
  const [nodes, setNodes] = useState(initialNodes);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("Just now");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((node) => {
          if (node.status === "Offline") return node;
          const jitter = Math.round(Math.random() * 6 - 3);
          const nextLatency = Math.max(12, (node.latencyMs || 25) + jitter);
          const nextSignal = Math.min(
            99,
            Math.max(55, node.signal + Math.round(Math.random() * 4 - 2))
          );
          return {
            ...node,
            latencyMs: nextLatency,
            signal: nextSignal,
          };
        })
      );
      setRefreshing(false);
      setLastRefreshed(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 600);
  };

  const onlineNodes = nodes.filter((n) => n.status !== "Offline");
  const avgLatency = Math.round(
    onlineNodes.reduce((sum, n) => sum + (n.latencyMs || 0), 0) /
      Math.max(1, onlineNodes.length)
  );
  const alertNodes = nodes.filter((n) => n.status !== "Online").length;

  return (
    <div className="mx-auto max-w-[1700px] space-y-5">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
            Infrastructure
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">LoRa Network</h1>
          <p className="mt-1 text-xs text-slate-400">
            Monitor underground gateways, LoRa connectivity, signal strength, and latency.
          </p>
        </div>

        <div className="flex flex-col items-start gap-1.5 md:items-end">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Network"}
          </button>

          <span className="text-[11px] text-slate-400">
            Last refreshed: {lastRefreshed}
          </span>
        </div>
      </div>

      {/* NETWORK STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Network Health
            </p>
            <Activity size={18} className="text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-400">96.4%</p>
          <p className="mt-1 text-xs text-slate-400">
            Overall packet delivery
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Connected Nodes
            </p>
            <Server size={18} className="text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {onlineNodes.length}/{nodes.length}
          </p>
          <p className="mt-1 text-xs text-slate-400">Gateways online</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Avg Latency
            </p>
            <Radio size={18} className="text-violet-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{avgLatency} ms</p>
          <p className="mt-1 text-xs text-emerald-400">Within normal range</p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-slate-400">
              Network Alerts
            </p>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-400">
            {alertNodes}
          </p>
          <p className="mt-1 text-xs text-slate-400">1 warning · 1 offline</p>
        </div>
      </div>

      {/* NETWORK TOPOLOGY */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Network Topology
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Live connectivity between mine infrastructure and safety helmets.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Online
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Warning
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Offline
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
            <div className="absolute inset-0 animate-pulse rounded-2xl border border-cyan-400/10" />
            <Server size={27} className="text-cyan-400" />
          </div>

          <p className="mt-3 text-xs font-semibold text-white">SafeMine Core</p>
          <p className="mt-1 text-[11px] text-emerald-400">
            Core Server · Online
          </p>

          <div className="h-10 w-px bg-gradient-to-b from-cyan-400/40 to-white/[0.06]" />

          <div className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-4">
            {nodes.map((node) => {
              const online = node.status === "Online";
              const warning = node.status === "Warning";

              return (
                <div
                  key={node.id}
                  className={`rounded-xl border p-4 ${
                    online
                      ? "border-emerald-400/15 bg-emerald-400/[0.03]"
                      : warning
                        ? "border-amber-400/15 bg-amber-400/[0.03]"
                        : "border-red-400/15 bg-red-400/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        online
                          ? "bg-emerald-400/10"
                          : warning
                            ? "bg-amber-400/10"
                            : "bg-red-400/10"
                      }`}
                    >
                      <Router
                        size={16}
                        className={
                          online
                            ? "text-emerald-400"
                            : warning
                              ? "text-amber-400"
                              : "text-red-400"
                        }
                      />
                    </div>

                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold ${
                        online
                          ? "text-emerald-400"
                          : warning
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          online
                            ? "bg-emerald-400"
                            : warning
                              ? "bg-amber-400"
                              : "bg-red-400"
                        }`}
                      />
                      {node.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-white">
                    {node.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {node.location}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400">Helmets</p>
                      <p className="mt-0.5 text-sm font-bold text-white">
                        {node.devices}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400">Latency</p>
                      <p className="mt-0.5 text-sm font-bold text-white">
                        {node.latencyMs ? `${node.latencyMs} ms` : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GATEWAY DETAILS */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Gateway Performance
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Detailed connectivity and traffic telemetry.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-white/[0.05] text-left">
                {[
                  "Gateway",
                  "Signal",
                  "Latency",
                  "Uptime",
                  "Devices",
                  "Traffic",
                  "Status",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {nodes.map((node) => {
                const online = node.status === "Online";
                const warning = node.status === "Warning";

                return (
                  <tr
                    key={node.id}
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/10">
                          <Router size={14} className="text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {node.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {node.id} · {node.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4">
                      <div className="flex items-center gap-2">
                        {node.signal === 0 ? (
                          <WifiOff size={14} className="text-red-400" />
                        ) : (
                          <Signal
                            size={14}
                            className={
                              node.signal < 70
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }
                          />
                        )}

                        <div className="w-24">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${
                                node.signal < 70
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                              style={{ width: `${node.signal}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {node.signal}%
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4">
                      <span className="text-xs text-slate-300">
                        {node.latencyMs ? `${node.latencyMs} ms` : "--"}
                      </span>
                    </td>

                    <td className="px-4">
                      <span className="text-xs text-slate-300">
                        {node.uptime}
                      </span>
                    </td>

                    <td className="px-4">
                      <span className="text-xs font-semibold text-white">
                        {node.devices}
                      </span>
                    </td>

                    <td className="px-4">
                      {online || warning ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <ArrowDown size={11} className="text-cyan-400" />
                            {node.download}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            <ArrowUp size={11} className="text-violet-400" />
                            {node.upload}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">--</span>
                      )}
                    </td>

                    <td className="px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          online
                            ? "bg-emerald-400/15 text-emerald-400"
                            : warning
                              ? "bg-amber-400/15 text-amber-400"
                              : "bg-red-400/15 text-red-400"
                        }`}
                      >
                        {online ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <AlertTriangle size={11} />
                        )}
                        {node.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NETWORK ALERT */}
      <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-5">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
            <AlertTriangle size={18} className="text-amber-400" />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              Network Warning
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">
              Gateway Gamma (Zone C) has degraded connectivity
            </h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-300">
              Signal strength is around 67% with elevated latency. Inspect the
              Zone C repeater line if packet delay continues to climb.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Network;