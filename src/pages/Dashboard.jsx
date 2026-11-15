import { useMemo, useState } from "react";
import {
  Wind,
  Thermometer,
  Move3d,
  Gauge,
  Droplets,
  Activity,
  Play,
  Square,
  RotateCcw,
  Siren,
  AlertTriangle,
  ShieldAlert,
  Pause,
  Radio,
} from "lucide-react";

import { useMineContext } from "../context/MineDataContext";
import useRiskForecast from "../hooks/useRiskForecast";

import StatCard from "../components/dashboard/StatCard";
import RiskScore from "../components/dashboard/RiskScore";
import MineMap from "../components/dashboard/MineMap";
import AlertPanel from "../components/dashboard/AlertPanel";
import SensorOverview from "../components/dashboard/SensorOverview";
import OxygenTrendChart from "../components/dashboard/OxygenTrendChart";
import WorkerStatus from "../components/dashboard/WorkerStatus";
import RiskChart from "../components/dashboard/RiskChart";

import Badge from "../components/common/Badge";
import Button from "../components/common/Button";

const bandVariant = {
  SAFE: "success",
  MODERATE: "warning",
  HIGH: "orange",
  CRITICAL: "danger",
};

function Dashboard({ onNavigate }) {
  const {
    workers,
    zones,
    alerts,
    statistics,
    riskHistory,
    oxygenHistory,
    simulation,
    firebase,
    environment,
    livePaused,
    toggleLivePaused,
    startSimulation,
    stopSimulation,
    resetSimulation,
  } = useMineContext();

  const forecastData = useRiskForecast();
  const [selectedTelemetryZone, setSelectedTelemetryZone] = useState("all");

  const zoneOxygenHistory = useMemo(() => {
    const offset =
      selectedTelemetryZone === "Zone C"
        ? -0.7
        : selectedTelemetryZone === "Zone B"
          ? -0.2
          : selectedTelemetryZone === "Zone A"
            ? 0.3
            : 0;

    return (oxygenHistory || []).map((point) => ({
      ...point,
      oxygen: Number(
        Math.min(21.5, Math.max(17.0, Number(point.oxygen) + offset)).toFixed(1)
      ),
    }));
  }, [oxygenHistory, selectedTelemetryZone]);

  const forecastSummary = useMemo(() => {
    const forecastPoints = forecastData.mineForecast.forecast;
    const lastForecastPoint = forecastPoints[forecastPoints.length - 1];

    return {
      trendDirection: forecastData.mineForecast.trendDirection,
      predictedScore: lastForecastPoint
        ? lastForecastPoint.value
        : statistics.overallRiskScore,
    };
  }, [forecastData, statistics]);

  const hazardZone = zones.find((zone) => zone.hazardDetected);

  const mapWorkers = useMemo(
    () =>
      workers.map((worker) => ({
        id: worker.id,
        x: worker.position.x,
        y: worker.position.y,
        status: worker.status.toLowerCase(),
      })),
    [workers]
  );

  const panelAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => !alert.acknowledged)
        .slice(0, 4)
        .map((alert) => ({
          id: alert.id,
          worker: `${alert.worker} (${alert.workerId})`,
          title: alert.title,
          detail: alert.message,
          time: new Date(alert.time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: alert.type === "Critical" ? "critical" : "warning",
          icon: alert.type === "Critical" ? Siren : AlertTriangle,
        })),
    [alerts]
  );

  const criticalAlertCount = alerts.filter(
    (alert) => alert.type === "Critical" && !alert.acknowledged
  ).length;

  const topRiskWorkers = useMemo(
    () =>
      [...workers]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 4)
        .map((worker) => ({
          id: worker.id,
          name: worker.name,
          zone: worker.zone,
          risk: worker.riskScore,
          status: worker.status,
        })),
    [workers]
  );

  const riskTrendData = useMemo(
    () =>
      riskHistory.map((point) => ({
        time: point.time,
        risk: point.score,
      })),
    [riskHistory]
  );

  const liveSensors = useMemo(() => {
    const scopedWorkers =
      selectedTelemetryZone === "all"
        ? workers
        : workers.filter((w) => w.zone === selectedTelemetryZone);
    const activeSet = scopedWorkers.length > 0 ? scopedWorkers : workers;
    const count = activeSet.length || 1;

    const avgGas =
      activeSet.reduce((total, worker) => total + Number(worker.gas || 0), 0) /
      count;

    const avgTemperature =
      activeSet.reduce(
        (total, worker) => total + Number(worker.temperature || 0),
        0
      ) / count;

    const avgMotion =
      activeSet.reduce(
        (total, worker) => total + Number(worker.motion || 0),
        0
      ) / count;

    const maxMotion = Math.max(
      ...activeSet.map((worker) => Number(worker.motion || 0)),
      0
    );

    const firebaseData = firebase?.data || {};
    const firebasePressure = Number(firebaseData.pressure);
    const firebaseHumidity = Number(firebaseData.humidity);
    const firebaseOxygen = Number(firebaseData.oxygen);
    const firebaseImpact =
      firebaseData.impact === true ||
      firebaseData.impact === 1 ||
      firebaseData.impact === "true";
    const firebaseGas = Number(firebaseData.gas);
    const firebaseTemperature = Number(firebaseData.temperature);
    const firebaseMotion =
      typeof firebaseData.motion === "boolean"
        ? firebaseData.motion
          ? 1
          : 0
        : Number(firebaseData.motion);

    const zoneOxygenOffset =
      selectedTelemetryZone === "Zone C"
        ? -0.7
        : selectedTelemetryZone === "Zone B"
          ? -0.2
          : selectedTelemetryZone === "Zone A"
            ? 0.3
            : 0;
    const zoneHumidityOffset =
      selectedTelemetryZone === "Zone C"
        ? 6.2
        : selectedTelemetryZone === "Zone B"
          ? 2.1
          : selectedTelemetryZone === "Zone A"
            ? -3.5
            : 0;

    const baseOxygen = (environment?.oxygen ?? 20.6) + zoneOxygenOffset;
    const baseHumidity = (environment?.humidity ?? 58.4) + zoneHumidityOffset;

    const oxygenValue =
      firebase?.connected && Number.isFinite(firebaseOxygen)
        ? firebaseOxygen
        : Number(Math.min(21.5, Math.max(17.0, baseOxygen)).toFixed(1));
    const gasValue =
      firebase?.connected && Number.isFinite(firebaseGas)
        ? firebaseGas
        : avgGas;
    const humidityValue =
      firebase?.connected && Number.isFinite(firebaseHumidity)
        ? firebaseHumidity
        : Number(Math.min(95, Math.max(30, baseHumidity)).toFixed(1));
    const temperatureValue =
      firebase?.connected && Number.isFinite(firebaseTemperature)
        ? firebaseTemperature
        : avgTemperature;
    const pressureValue =
      firebase?.connected && Number.isFinite(firebasePressure)
        ? firebasePressure
        : environment?.pressure ?? 1013.2;
    const motionValue =
      firebase?.connected && Number.isFinite(firebaseMotion)
        ? firebaseMotion
        : avgMotion;
    const impactDetected = firebase?.connected
      ? firebaseImpact
      : Boolean(environment?.impact) || maxMotion >= 0.85;

    const scopeLabel =
      selectedTelemetryZone === "all"
        ? `Average across ${count} active helmets`
        : `${selectedTelemetryZone} · ${count} helmet${count === 1 ? "" : "s"}`;

    return [
      {
        id: "oxygen",
        name: "Oxygen Level",
        sensorType: "O₂ Cell",
        category: "atmospheric",
        value: oxygenValue.toFixed(1),
        unit: "% O₂",
        status:
          oxygenValue < 19.0
            ? "Critical Low"
            : oxygenValue < 19.5
              ? "Low Advisory"
              : "Normal",
        tone:
          oxygenValue < 19.0
            ? "red"
            : oxygenValue < 19.5
              ? "amber"
              : "emerald",
        safeRange: "Safe 19.5–23.5%",
        progress: ((oxygenValue - 16) / (23.5 - 16)) * 100,
        detail:
          selectedTelemetryZone === "all"
            ? "Tunnel ventilation oxygen saturation"
            : `${selectedTelemetryZone} airway intake`,
        icon: Activity,
      },
      {
        id: "gas",
        name: "Gas Concentration",
        sensorType: "MQ-2 CH₄/CO",
        category: "atmospheric",
        value: gasValue.toFixed(1),
        unit: "ppm",
        status:
          gasValue > 50 ? "Critical" : gasValue > 30 ? "Elevated" : "Normal",
        tone: gasValue > 50 ? "red" : gasValue > 30 ? "amber" : "emerald",
        safeRange: "Limit < 50 ppm",
        progress: (gasValue / 80) * 100,
        detail: scopeLabel,
        icon: Wind,
      },
      {
        id: "humidity",
        name: "Humidity Level",
        sensorType: "DHT11 RH",
        category: "atmospheric",
        value: humidityValue.toFixed(1),
        unit: "% RH",
        status:
          humidityValue > 80
            ? "High Moisture"
            : humidityValue > 72
              ? "Elevated"
              : "Normal",
        tone:
          humidityValue > 80
            ? "amber"
            : humidityValue > 72
              ? "amber"
              : "cyan",
        safeRange: "Safe 40–75%",
        progress: humidityValue,
        detail:
          selectedTelemetryZone === "all"
            ? "Underground relative humidity"
            : `${selectedTelemetryZone} moisture index`,
        icon: Droplets,
      },
      {
        id: "temperature",
        name: "Ambient Temperature",
        sensorType: "DHT11 Thermal",
        category: "atmospheric",
        value: temperatureValue.toFixed(1),
        unit: "°C",
        status:
          temperatureValue > 42
            ? "Critical"
            : temperatureValue > 38
              ? "Elevated"
              : "Normal",
        tone:
          temperatureValue > 42
            ? "red"
            : temperatureValue > 38
              ? "amber"
              : "emerald",
        safeRange: "Limit < 38 °C",
        progress: (temperatureValue / 50) * 100,
        detail: scopeLabel,
        icon: Thermometer,
      },
      {
        id: "pressure",
        name: "Tunnel Pressure",
        sensorType: "BMP180",
        category: "physical",
        value: pressureValue.toFixed(1),
        unit: "hPa",
        status:
          pressureValue < 950 || pressureValue > 1050 ? "Abnormal" : "Normal",
        tone:
          pressureValue < 950 || pressureValue > 1050 ? "amber" : "cyan",
        safeRange: "Safe 950–1050 hPa",
        progress: ((pressureValue - 950) / 100) * 100,
        detail: "Barometric ventilation pressure",
        icon: Gauge,
      },
      {
        id: "motion",
        name: "Motion & Impact",
        sensorType: "MPU6050 IMU",
        category: "physical",
        value: motionValue.toFixed(2),
        unit: "g",
        status: impactDetected
          ? "Impact Detected"
          : motionValue > 0.5
            ? "Abnormal Motion"
            : "Normal",
        tone: impactDetected
          ? "red"
          : motionValue > 0.5
            ? "amber"
            : "emerald",
        safeRange: "Alert > 0.50 g",
        progress: (motionValue / 1.0) * 100,
        detail: impactDetected
          ? "High-g fall/impact flag active"
          : "0 impact events · " + scopeLabel,
        icon: Move3d,
      },
    ];
  }, [workers, firebase, environment, selectedTelemetryZone]);

  return (
    <div className="mx-auto max-w-[1700px] space-y-5">
      {/* PAGE HEADER + SIMULATION CONTROL */}
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Command Center
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Mine Safety Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time worker monitoring, zone risk analytics, and predictive safety intelligence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={livePaused ? Play : Pause}
            onClick={toggleLivePaused}
          >
            {livePaused ? "Resume Feed" : "Pause Feed"}
          </Button>

          {simulation.active ? (
            <>
              <span className="flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-400/[0.08] px-3 py-2 text-xs font-semibold text-amber-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                Incident Simulation — Stage {simulation.stage + 1}/
                {simulation.stageCount}
              </span>

              <Button
                size="sm"
                variant="secondary"
                icon={Square}
                onClick={stopSimulation}
              >
                Stop
              </Button>

              <Button
                size="sm"
                variant="ghost"
                icon={RotateCcw}
                onClick={resetSimulation}
              >
                Reset
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="danger"
              icon={Play}
              onClick={startSimulation}
            >
              Start Safety Simulation
            </Button>
          )}
        </div>
      </div>

      {/* TELEMETRY STREAM STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              livePaused && !simulation.active
                ? "bg-amber-400"
                : "bg-emerald-400 animate-pulse"
            }`}
          />
          <Radio size={15} className="text-emerald-400" />
          <span className="text-xs font-semibold text-white">
            {firebase?.connected
              ? "Firebase Live Connected"
              : "Live Demo Telemetry Active"}
          </span>
          <span className="text-xs text-emerald-400">
            {livePaused && !simulation.active
              ? "— Stream Paused"
              : `— Streaming ${workers.length} Smart Helmets (2s interval)`}
          </span>
        </div>

        <span className="text-xs text-slate-400">
          {firebase?.connected
            ? `Path: ${firebase?.path || "SafeMine"}`
            : "Simulated IoT Sensor Feed"}
        </span>
      </div>

      {/* ZONE HAZARD BANNER */}
      {hazardZone && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/15">
              <ShieldAlert size={20} className="text-red-400" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-red-400">
                Environmental Hazard Detected
              </p>
              <p className="mt-0.5 text-xs font-medium text-white">
                {hazardZone.hazardReason}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="danger"
            onClick={() => onNavigate?.("evacuation")}
          >
            Open Evacuation Plan
          </Button>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          type="workers"
          title="Total Workers"
          value={String(statistics.totalWorkers)}
          subtitle="underground shift"
        />

        <StatCard
          type="safe"
          title="Safe"
          value={String(statistics.safeWorkers)}
          subtitle="within normal range"
        />

        <StatCard
          type="warning"
          title="At Risk"
          value={String(statistics.atRiskWorkers)}
          subtitle="advisory monitoring"
        />

        <StatCard
          type="critical"
          title="Critical"
          value={String(statistics.criticalWorkers)}
          subtitle="immediate response"
        />

        <StatCard
          type="alerts"
          title="Active Alerts"
          value={String(statistics.activeAlerts)}
          subtitle="unacknowledged"
        />

        <StatCard
          type="zones"
          title="High-Risk Zones"
          value={String(statistics.highRiskZones)}
          subtitle={`of ${zones.length} active zones`}
        />
      </div>

      {/* COMMAND SUMMARY */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Mine Risk Index
          </p>

          <div className="mt-2.5 flex items-center gap-2.5">
            <Badge variant={bandVariant[statistics.overallBand]} dot>
              {statistics.overallBand}
            </Badge>

            <span className="text-xs font-medium text-slate-300">
              {statistics.overallRiskScore} / 10 risk ({statistics.overallSafetyScore}%)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Highest-Risk Zone
          </p>

          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="text-sm font-semibold text-white">
              {statistics.highestRiskZone?.name || "--"}
            </span>

            {statistics.highestRiskZone && (
              <Badge variant={bandVariant[statistics.highestRiskZone.band]}>
                {statistics.highestRiskZone.band}
              </Badge>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0c121c] p-5">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Highest-Risk Worker
          </p>

          <div className="mt-2.5 flex items-center gap-2.5">
            <span className="text-sm font-semibold text-white">
              {statistics.highestRiskWorker?.name || "--"}
            </span>

            {statistics.highestRiskWorker && (
              <Badge variant={bandVariant[statistics.highestRiskWorker.band]}>
                {statistics.highestRiskWorker.band}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* TELEMETRY DATA CARDS (Oxygen, Gas, Humidity, Temperature, Pressure, Motion) */}
      <SensorOverview
        sensors={liveSensors}
        selectedZone={selectedTelemetryZone}
        onZoneChange={setSelectedTelemetryZone}
        onSelectSensor={() => onNavigate?.("sensors")}
      />

      {/* OXYGEN LEVEL HISTORY (LAST 5 MINUTES) */}
      <OxygenTrendChart
        data={zoneOxygenHistory}
        zoneLabel={
          selectedTelemetryZone === "all" ? "All Zones" : selectedTelemetryZone
        }
      />

      {/* LIVE MAP + RISK + ALERTS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">
        <MineMap workers={mapWorkers} />

        <div className="space-y-5">
          <RiskScore
            score={statistics.overallRiskScore}
            forecast={forecastSummary}
            workerCount={statistics.totalWorkers}
          />

          <AlertPanel
            alerts={panelAlerts}
            criticalCount={criticalAlertCount}
            onViewAll={() => onNavigate?.("alerts")}
          />
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RiskChart data={riskTrendData} />

        <WorkerStatus
          workers={topRiskWorkers}
          onViewAll={() => onNavigate?.("workers")}
        />
      </div>
    </div>
  );
}

export default Dashboard;