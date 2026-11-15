import { ArrowUpRight } from "lucide-react";

const toneStyles = {
  emerald: {
    iconWrap: "bg-emerald-500/10 text-emerald-400",
    statusText: "text-emerald-400",
    bar: "bg-emerald-400",
    borderHover: "hover:border-emerald-400/30",
  },
  cyan: {
    iconWrap: "bg-cyan-500/10 text-cyan-400",
    statusText: "text-cyan-400",
    bar: "bg-cyan-400",
    borderHover: "hover:border-cyan-400/30",
  },
  amber: {
    iconWrap: "bg-amber-500/10 text-amber-400",
    statusText: "text-amber-400",
    bar: "bg-amber-400",
    borderHover: "hover:border-amber-400/30",
  },
  red: {
    iconWrap: "bg-red-500/10 text-red-400",
    statusText: "text-red-400",
    bar: "bg-red-400",
    borderHover: "hover:border-red-400/30",
  },
};

function TelemetryCard({
  name,
  sensorType,
  value,
  unit,
  status,
  tone = "emerald",
  safeRange,
  progress = 50,
  detail,
  icon: Icon,
  onSelect,
}) {
  const style = toneStyles[tone] || toneStyles.emerald;
  const clampedProgress = Math.max(4, Math.min(100, Math.round(progress)));

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-200">{name}</span>
            {sensorType && (
              <>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span className="truncate text-slate-400">{sensorType}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
              {value}
            </span>
            <span className="text-xs font-medium text-slate-400">{unit}</span>
          </div>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
        >
          {Icon && <Icon size={19} />}
        </div>
      </div>

      {/* Threshold progress bar */}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {/* Unboxed footer metadata */}
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className={`font-semibold ${style.statusText}`}>{status}</span>
        <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400 tabular-nums">
          {safeRange}
          {onSelect && (
            <ArrowUpRight
              size={13}
              className="text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-200"
            />
          )}
        </span>
      </div>

      {detail && (
        <p className="mt-1.5 text-[11px] text-slate-400">{detail}</p>
      )}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`group w-full rounded-xl border border-white/[0.08] bg-[#0c121c] p-5 text-left transition-colors ${style.borderHover} hover:bg-[#0f1724] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c121c] p-5">
      {content}
    </div>
  );
}

export default TelemetryCard;
