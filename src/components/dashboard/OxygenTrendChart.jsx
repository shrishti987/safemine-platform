import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

function OxygenTrendChart({ data = [], zoneLabel = "All Zones" }) {
  const stats = useMemo(() => {
    if (!data.length) {
      return {
        current: 20.6,
        min: 20.6,
        max: 20.6,
        delta: 0,
      };
    }

    const values = data.map((d) => Number(d.oxygen));
    const current = values[values.length - 1];
    const first = values[0];
    return {
      current,
      min: Math.min(...values),
      max: Math.max(...values),
      delta: Number((current - first).toFixed(1)),
    };
  }, [data]);

  const isCritical = stats.current < 19.0;
  const isLow = !isCritical && stats.current < 19.5;
  const strokeColor = isCritical
    ? "#f87171"
    : isLow
      ? "#fbbf24"
      : "#34d399";

  const statusText = isCritical
    ? "Critical Low O₂"
    : isLow
      ? "Below 19.5% Safe Limit"
      : "Nominal Ventilation";

  const statusClass = isCritical
    ? "text-red-400"
    : isLow
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <section
      aria-label="Oxygen Level History Last 5 Minutes"
      className="rounded-xl border border-white/[0.08] bg-[#0c121c] p-5"
    >
      <div className="flex flex-col justify-between gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-emerald-400">{zoneLabel}</span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>5-Minute Rolling Telemetry</span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-white">
            Oxygen Level Trend (Last 5 Minutes)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div>
            <p className="text-[11px] text-slate-400">Current O₂</p>
            <p className="mt-0.5 font-mono text-base font-bold text-white tabular-nums">
              {stats.current.toFixed(1)}%
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">5m Range</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-200 tabular-nums">
              {stats.min.toFixed(1)}% – {stats.max.toFixed(1)}%
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">5m Change</p>
            <p
              className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${
                stats.delta < 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {stats.delta >= 0 ? `+${stats.delta.toFixed(1)}` : stats.delta.toFixed(1)}%
            </p>
          </div>

          <div>
            <p className="text-[11px] text-slate-400">Status</p>
            <p className={`mt-0.5 text-sm font-semibold ${statusClass}`}>
              {statusText}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 16, left: -8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              minTickGap={28}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <YAxis
              domain={[18.0, 22.0]}
              ticks={[18.0, 19.0, 19.5, 20.5, 21.5, 22.0]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(1)}%`}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />

            <Tooltip
              contentStyle={{
                background: "#111925",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#f8fafc",
              }}
              labelStyle={{ color: "#94a3b8", marginBottom: "2px" }}
              formatter={(value) => [`${Number(value).toFixed(1)} % O₂`, "Oxygen"]}
            />

            <ReferenceLine
              y={19.5}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
              label={{
                value: "Min Safe 19.5%",
                position: "insideTopRight",
                fill: "#fbbf24",
                fontSize: 11,
              }}
            />

            <Line
              type="monotone"
              dataKey="oxygen"
              stroke={strokeColor}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              activeDot={{
                r: 5,
                fill: strokeColor,
                stroke: "#0c121c",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default OxygenTrendChart;
