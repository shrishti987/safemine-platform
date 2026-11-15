import { useMemo, useState } from "react";
import {
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Move3d,
  Activity,
} from "lucide-react";
import TelemetryCard from "./TelemetryCard";

const defaultSensors = [
  {
    id: "oxygen",
    name: "Oxygen Level",
    sensorType: "O₂ Cell",
    category: "atmospheric",
    value: "20.6",
    unit: "% O₂",
    status: "Normal",
    tone: "emerald",
    safeRange: "Safe 19.5–23.5%",
    progress: 82,
    detail: "Ventilation shaft oxygen nominal",
    icon: Activity,
  },
  {
    id: "gas",
    name: "Gas Concentration",
    sensorType: "MQ-2 CH₄/CO",
    category: "atmospheric",
    value: "24.8",
    unit: "ppm",
    status: "Normal",
    tone: "emerald",
    safeRange: "Limit < 50 ppm",
    progress: 48,
    detail: "Methane & combustible gas monitor",
    icon: Wind,
  },
  {
    id: "humidity",
    name: "Humidity Level",
    sensorType: "DHT11 RH",
    category: "atmospheric",
    value: "58.4",
    unit: "% RH",
    status: "Normal",
    tone: "cyan",
    safeRange: "Safe 40–75%",
    progress: 58,
    detail: "Underground relative moisture",
    icon: Droplets,
  },
  {
    id: "temperature",
    name: "Ambient Temperature",
    sensorType: "DHT11 Thermal",
    category: "atmospheric",
    value: "33.6",
    unit: "°C",
    status: "Normal",
    tone: "emerald",
    safeRange: "Limit < 38 °C",
    progress: 65,
    detail: "Tunnel & helmet ambient heat",
    icon: Thermometer,
  },
  {
    id: "pressure",
    name: "Tunnel Pressure",
    sensorType: "BMP180",
    category: "physical",
    value: "1013.2",
    unit: "hPa",
    status: "Normal",
    tone: "cyan",
    safeRange: "Safe 950–1050 hPa",
    progress: 62,
    detail: "Barometric airway stability",
    icon: Gauge,
  },
  {
    id: "motion",
    name: "Motion & Impact",
    sensorType: "MPU6050 IMU",
    category: "physical",
    value: "0.18",
    unit: "g",
    status: "Normal",
    tone: "emerald",
    safeRange: "Alert > 0.50 g",
    progress: 36,
    detail: "No high-impact fall events",
    icon: Move3d,
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Sensors" },
  { id: "atmospheric", label: "Atmospheric" },
  { id: "physical", label: "Physical & Motion" },
];

const ZONE_OPTIONS = [
  { id: "all", label: "All Zones" },
  { id: "Zone A", label: "Zone A" },
  { id: "Zone B", label: "Zone B" },
  { id: "Zone C", label: "Zone C" },
];

function SensorOverview({
  sensors = defaultSensors,
  selectedZone = "all",
  onZoneChange,
  onSelectSensor,
}) {
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleSensors = useMemo(() => {
    if (activeCategory === "all") return sensors;
    return sensors.filter((sensor) => sensor.category === activeCategory);
  }, [sensors, activeCategory]);

  return (
    <section aria-label="Mine Safety Telemetry Overview" className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-white/[0.06] pb-3 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-base font-semibold text-white">
            Live Telemetry Readings
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Oxygen levels, gas concentration, humidity, temperature, pressure, and motion monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onZoneChange && (
            <div
              role="group"
              aria-label="Filter telemetry by mine zone"
              className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#0c121c] p-1"
            >
              {ZONE_OPTIONS.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => onZoneChange(zone.id)}
                  className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedZone === zone.id
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          )}

          <div
            role="group"
            aria-label="Filter telemetry by sensor category"
            className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#0c121c] p-1"
          >
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  activeCategory === tab.id
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleSensors.map((sensor) => (
          <TelemetryCard
            key={sensor.id || sensor.name}
            name={sensor.name}
            sensorType={sensor.sensorType}
            value={sensor.value}
            unit={sensor.unit}
            status={sensor.status}
            tone={sensor.tone || sensor.color}
            safeRange={sensor.safeRange}
            progress={sensor.progress}
            detail={sensor.detail}
            icon={sensor.icon}
            onSelect={onSelectSensor ? () => onSelectSensor(sensor) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default SensorOverview;