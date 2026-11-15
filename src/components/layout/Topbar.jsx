import { useMemo, useState } from "react";
import {
  Bell,
  Search,
  CircleHelp,
  CalendarDays,
  Menu,
  User,
} from "lucide-react";
import { useMineContext } from "../../context/MineDataContext";
import Modal from "../common/Modal";
import WorkerDetails from "../workers/WorkerDetails";

const pageLabels = {
  dashboard: { section: "Mine Operations", title: "Safety Command Center" },
  "live-mine": { section: "Live Tracking", title: "Underground Mine Map" },
  workers: { section: "Workforce", title: "Worker Telemetry" },
  alerts: { section: "Emergency Center", title: "Safety Alerts & Warnings" },
  sensors: { section: "Telemetry", title: "Helmet Sensor Streams" },
  evacuation: { section: "Emergency Response", title: "Evacuation Routing" },
  analytics: { section: "Intelligence", title: "Safety Analytics" },
  forecast: { section: "Predictive AI", title: "Risk Forecast" },
  help: { section: "Support", title: "Help & Documentation" },
  helmets: { section: "IoT Hardware", title: "Smart Helmets" },
  network: { section: "Infrastructure", title: "LoRa Gateway Network" },
  maintenance: { section: "Device Management", title: "Maintenance Schedule" },
  settings: { section: "System", title: "Platform Settings" },
};

function Topbar({ activePage = "dashboard", onNavigate, onOpenMobileMenu }) {
  const { workers, statistics, alerts, acknowledgeAlert } = useMineContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  const activeAlerts = statistics?.activeAlerts || 0;
  const pageInfo = pageLabels[activePage] || pageLabels.dashboard;

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    []
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return workers
      .filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.id.toLowerCase().includes(q) ||
          w.zone.toLowerCase().includes(q) ||
          w.helmetId.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [workers, searchQuery]);

  const selectedWorker =
    workers.find((w) => w.id === selectedWorkerId) || null;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.06] bg-[#070b12]/90 px-4 sm:px-6 backdrop-blur-xl">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-slate-400 hover:bg-white/[0.04] hover:text-white md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              {pageInfo.section}
            </p>
            <h2 className="mt-0.5 text-base sm:text-lg font-semibold text-white">
              {pageInfo.title}
            </h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="flex h-10 w-60 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 focus-within:border-emerald-400/40">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workers, ID, zone..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
              />
            </div>

            {searchFocused && searchQuery.trim() && (
              <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c121c] shadow-2xl">
                {searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400">
                    No matching workers found.
                  </p>
                ) : (
                  searchResults.map((worker) => (
                    <button
                      key={worker.id}
                      type="button"
                      onMouseDown={() => {
                        setSelectedWorkerId(worker.id);
                        setSearchQuery("");
                      }}
                      className="flex w-full items-center justify-between border-b border-white/[0.04] px-3.5 py-2.5 text-left last:border-b-0 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05]">
                          <User size={13} className="text-slate-300" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {worker.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {worker.id} · {worker.zone}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          worker.status === "Critical"
                            ? "text-red-400"
                            : worker.status === "Warning"
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {worker.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 lg:flex">
            <CalendarDays size={15} className="text-slate-400" />
            <span className="text-xs text-slate-300">{formattedDate}</span>
          </div>

          {/* Help */}
          <button
            type="button"
            onClick={() => onNavigate?.("help")}
            title="Help & Support"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-slate-400 transition hover:bg-white/[0.04] hover:text-white sm:flex"
          >
            <CircleHelp size={17} />
          </button>

          {/* Notification */}
          <button
            type="button"
            onClick={() => onNavigate?.("alerts")}
            title="View Active Alerts"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
          >
            <Bell size={17} />
            {activeAlerts > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {activeAlerts}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={() => onNavigate?.("settings")}
            title="Admin Settings"
            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 transition hover:bg-white/[0.05]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-[11px] font-bold text-slate-950">
              AD
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-white">Admin</p>
              <p className="text-[10px] text-slate-400">Safety Manager</p>
            </div>
          </button>
        </div>
      </header>

      <Modal
        isOpen={Boolean(selectedWorker)}
        onClose={() => setSelectedWorkerId(null)}
        size="lg"
        showClose={false}
      >
        {selectedWorker && (
          <WorkerDetails
            worker={selectedWorker}
            onClose={() => setSelectedWorkerId(null)}
            onAcknowledge={(worker) => {
              const openAlert = alerts.find(
                (a) => a.workerId === worker.id && !a.acknowledged
              );
              if (openAlert) acknowledgeAlert(openAlert.id);
            }}
          />
        )}
      </Modal>
    </>
  );
}

export default Topbar;