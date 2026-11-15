import {
  ShieldAlert,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

function RiskScore({ score = 3.2, forecast = null, workerCount = 8 }) {
  const percentage = Math.min(100, Math.max(0, Math.round(score * 10)));

  let level = "LOW";
  let levelColor = "text-emerald-400";
  let ringColor = "border-emerald-400";
  let barColor = "bg-emerald-400";

  if (score >= 7) {
    level = "CRITICAL";
    levelColor = "text-red-400";
    ringColor = "border-red-400";
    barColor = "bg-red-400";
  } else if (score >= 4) {
    level = "MODERATE";
    levelColor = "text-amber-400";
    ringColor = "border-amber-400";
    barColor = "bg-amber-400";
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
            AI Risk Assessment
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white">
            Overall Mine Risk
          </h3>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10">
          <ShieldAlert size={17} className="text-emerald-400" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <div
          className={`relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] ${ringColor}`}
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-white">{score}</p>
            <p className={`mt-0.5 text-[11px] font-bold tracking-[0.15em] ${levelColor}`}>
              {level}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-400">Risk index</span>
          <span className={`font-semibold ${levelColor}`}>{percentage}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/[0.05] pt-4">
        <Activity size={14} className="shrink-0 text-emerald-400" />
        <span className="text-xs text-slate-400">
          Analyzing {workerCount} active helmet streams
        </span>
      </div>

      {forecast && (
        <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3">
          {forecast.trendDirection === "rising" ? (
            <TrendingUp size={14} className="shrink-0 text-amber-400" />
          ) : forecast.trendDirection === "falling" ? (
            <TrendingDown size={14} className="shrink-0 text-emerald-400" />
          ) : (
            <Minus size={14} className="shrink-0 text-slate-400" />
          )}

          <span className="text-xs text-slate-400">
            {forecast.trendDirection.charAt(0).toUpperCase() +
              forecast.trendDirection.slice(1)}{" "}
            — predicted{" "}
            <span className="font-semibold text-white">
              {Number(forecast.predictedScore ?? score).toFixed(1)}/10
            </span>{" "}
            in 30 min
          </span>
        </div>
      )}
    </div>
  );
}

export default RiskScore;