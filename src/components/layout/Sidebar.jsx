import {
  LayoutDashboard,
  Map,
  Users,
  Bell,
  Radio,
  Route,
  BarChart3,
  HardHat,
  Wifi,
  Wrench,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useMineContext } from "../../context/MineDataContext";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
  },
  {
    label: "Live Mine",
    icon: Map,
    id: "live-mine",
  },
  {
    label: "Workers",
    icon: Users,
    id: "workers",
  },
  {
    label: "Alerts",
    icon: Bell,
    id: "alerts",
    showAlertBadge: true,
  },
  {
    label: "Sensors",
    icon: Radio,
    id: "sensors",
  },
  {
    label: "Evacuation",
    icon: Route,
    id: "evacuation",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    id: "analytics",
  },
  {
    label: "AI Forecast",
    icon: Sparkles,
    id: "forecast",
  },
  {
    label: "Help & Support",
    icon: HelpCircle,
    id: "help",
  },
];

const systemItems = [
  {
    label: "Smart Helmets",
    icon: HardHat,
    id: "helmets",
  },
  {
    label: "LoRa Network",
    icon: Wifi,
    id: "network",
  },
  {
    label: "Maintenance",
    icon: Wrench,
    id: "maintenance",
  },
  {
    label: "Settings",
    icon: Settings,
    id: "settings",
  },
];

function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { statistics, firebase } = useMineContext();
  const activeAlerts = statistics?.activeAlerts || 0;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/[0.06] bg-[#0a0f18] transition-all duration-300 ${
          collapsed ? "md:w-[78px]" : "md:w-[250px]"
        } w-[250px] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div
          className={`flex h-[76px] items-center justify-between border-b border-white/[0.06] ${
            collapsed ? "md:justify-center px-4 md:px-0" : "px-5"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={23} />
            </div>

            {(!collapsed || mobileOpen) && (
              <div className={collapsed ? "md:hidden" : ""}>
                <h1 className="text-[17px] font-bold tracking-tight text-white">
                  Safe<span className="text-emerald-400">Mine</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  Safety Command
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white md:hidden"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className={`mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${
              collapsed ? "md:hidden" : ""
            }`}
          >
            Monitoring
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              const badgeCount = item.showAlertBadge ? activeAlerts : 0;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  title={collapsed ? item.label : ""}
                  className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all ${
                    collapsed ? "md:justify-center gap-3 md:gap-0" : "gap-3"
                  } ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    {badgeCount > 0 && collapsed && (
                      <span className="absolute -right-1 -top-1 hidden h-2 w-2 rounded-full bg-red-500 md:block" />
                    )}
                  </div>

                  <span
                    className={`flex-1 text-[13px] font-medium ${
                      collapsed ? "md:hidden" : ""
                    }`}
                  >
                    {item.label}
                  </span>

                  {badgeCount > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/15 px-1.5 text-[11px] font-bold text-red-400 ${
                        collapsed ? "md:hidden" : ""
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <p
            className={`mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${
              collapsed ? "md:hidden" : ""
            }`}
          >
            System
          </p>

          <nav className="space-y-1">
            {systemItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  title={collapsed ? item.label : ""}
                  className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all ${
                    collapsed ? "md:justify-center gap-3 md:gap-0" : "gap-3"
                  } ${
                    active
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon size={18} className="shrink-0" />

                  <span
                    className={`text-[13px] font-medium ${
                      collapsed ? "md:hidden" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom system status */}
        <div className="border-t border-white/[0.06] p-3">
          <div
            className={`rounded-xl bg-emerald-500/[0.06] ${
              collapsed ? "md:p-2 p-3" : "p-3"
            }`}
          >
            <div
              className={`flex items-center ${
                collapsed ? "md:justify-center gap-2 md:gap-0" : "gap-2"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>

              <span
                className={`text-xs font-medium text-emerald-400 ${
                  collapsed ? "md:hidden" : ""
                }`}
              >
                {firebase?.connected ? "Live Telemetry Active" : "Demo Telemetry Active"}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 hidden w-full items-center justify-center rounded-lg py-2 text-slate-500 transition hover:bg-white/[0.04] hover:text-slate-200 md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;