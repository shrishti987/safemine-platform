import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import workersRoster from "../data/workers";
import zonesRoster from "../data/zones";

import {
  SAFETY_BANDS,
  computeWorkerRisk,
  computeZoneRisk,
  getBandFromScore,
} from "../utils/riskEngine";

import {
  PRIMARY_WORKER_ID,
  SECONDARY_WORKER_ID,
  STAGE_COUNT,
  TICK_INTERVAL_MS,
  getScenarioStage,
  isFinalStage,
} from "../utils/simulationScenario";

import { onValue, ref } from "firebase/database";
import { database } from "../firebase";

const HISTORY_LIMIT = 30;
const TIMELINE_LIMIT = 20;

const MineDataContext = createContext(null);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const meanRevert = (current, baseline, amount, decay = 0.85) =>
  baseline +
  (current - baseline) * decay +
  (Math.random() * amount * 2 - amount);

function buildBaselineReadings(forSimulation = false) {
  const readings = {};

  workersRoster.forEach((worker) => {
    if (forSimulation && worker.id === PRIMARY_WORKER_ID) {
      readings[worker.id] = {
        ...getScenarioStage(0)[PRIMARY_WORKER_ID],
      };
      return;
    }

    readings[worker.id] = {
      gas: worker.gas,
      temperature: worker.temperature,
      motion: worker.motion,
      battery: worker.battery,
      signal: worker.signal,
    };
  });

  return readings;
}

const DEMO_BASELINE_READINGS = buildBaselineReadings(false);

function buildSeededHistory(readings, nowTimestamp, forSimulation = false) {
  const history = {};
  const points = 10;
  const stepMs = 120000; // 2-minute intervals over last 20 mins

  workersRoster.forEach((worker) => {
    const target = readings[worker.id];
    const entries = [];

    for (let i = points - 1; i >= 0; i--) {
      const t = nowTimestamp - i * stepMs;
      const progress = (points - 1 - i) / (points - 1);

      // For non-simulation demo, show subtle realistic upward drift on SM-003 & SM-004
      let gas;
      let temperature;
      let motion = target.motion;

      if (!forSimulation && worker.id === "SM-004") {
        gas = Number((38 + progress * (target.gas - 38)).toFixed(1));
        temperature = Number(
          (36.2 + progress * (target.temperature - 36.2)).toFixed(1)
        );
        motion = Number((0.25 + progress * (target.motion - 0.25)).toFixed(2));
      } else if (!forSimulation && worker.id === "SM-003") {
        gas = Number((28 + progress * (target.gas - 28)).toFixed(1));
        temperature = Number(
          (35.4 + progress * (target.temperature - 35.4)).toFixed(1)
        );
        motion = Number((0.18 + progress * (target.motion - 0.18)).toFixed(2));
      } else {
        const jitter = Math.sin(i * 1.4) * 0.8;
        gas = Number(clamp(target.gas + jitter, 5, 120).toFixed(1));
        temperature = Number(
          clamp(target.temperature + jitter * 0.2, 24, 50).toFixed(1)
        );
      }

      entries.push({
        gas,
        temperature,
        motion,
        battery: Math.min(100, Math.round(target.battery + i * 0.2)),
        signal: target.signal,
        timestamp: t,
      });
    }

    history[worker.id] = entries;
  });

  return history;
}

function buildSeededRiskHistory(readings, history, nowTimestamp) {
  const stepMs = 120000;
  const points = 10;
  const series = [];

  for (let i = points - 1; i >= 0; i--) {
    const idx = points - 1 - i;
    const t = nowTimestamp - i * stepMs;

    let total = 0;
    workersRoster.forEach((worker) => {
      const slice = (history[worker.id] || []).slice(0, idx + 1);
      const reading = slice[slice.length - 1] || readings[worker.id];
      const risk = computeWorkerRisk({ ...worker, ...reading }, slice);
      total += risk.safetyScore;
    });

    const avg = total / workersRoster.length;
    series.push({
      time: new Date(t).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      score: Number((avg / 10).toFixed(1)),
    });
  }

  return series;
}

function buildBaselineTimeline(timestamp) {
  const timeline = {};

  workersRoster.forEach((worker) => {
    const entries = [
      {
        id: `${worker.id}-seed-${timestamp}`,
        time: timestamp - 600000,
        icon: "🟢",
        label: "Shift check-in — helmet telemetry connected.",
      },
    ];

    if (worker.id === "SM-004") {
      entries.push({
        id: `${worker.id}-warn-${timestamp}`,
        time: timestamp - 180000,
        icon: "🟠",
        label: "Methane concentration crossed 50 ppm threshold in Zone C.",
      });
      entries.push({
        id: `${worker.id}-crit-${timestamp}`,
        time: timestamp - 60000,
        icon: "🔴",
        label: "Critical alert active — elevated gas, heat, and motion.",
      });
    } else if (worker.id === "SM-003") {
      entries.push({
        id: `${worker.id}-warn-${timestamp}`,
        time: timestamp - 120000,
        icon: "🟡",
        label: "Thermal reading rose above 38°C advisory threshold.",
      });
    } else if (worker.id === "SM-007") {
      entries.push({
        id: `${worker.id}-bat-${timestamp}`,
        time: timestamp - 240000,
        icon: "🟡",
        label: "Helmet battery dropped below 30% — schedule swap.",
      });
    }

    timeline[worker.id] = entries;
  });

  return timeline;
}

function buildDemoAlerts(nowTimestamp) {
  return [
    {
      id: "ALT-DEMO-001",
      kind: "current",
      type: "Critical",
      title: "High gas & motion spike",
      message:
        "Gas reached 68.4 ppm with 0.72g abnormal motion near Excavation Lead Aman Rawat.",
      worker: "Aman Rawat",
      workerId: "SM-004",
      zone: "Zone C",
      time: nowTimestamp - 60000,
      acknowledged: false,
    },
    {
      id: "ALT-DEMO-002",
      kind: "current",
      type: "Warning",
      title: "Temperature rising above limit",
      message:
        "Zone B temperature reached 39.4°C on Helmet HLM-003; ventilation check advised.",
      worker: "Vikas Negi",
      workerId: "SM-003",
      zone: "Zone B",
      time: nowTimestamp - 180000,
      acknowledged: false,
    },
    {
      id: "ALT-DEMO-003",
      kind: "predictive",
      type: "Warning",
      title: "Weak LoRa signal & rising gas trend",
      message:
        "Helmet HLM-004 signal degraded to 66% while Zone C gas trend continues upward.",
      worker: "Aman Rawat",
      workerId: "SM-004",
      zone: "Zone C",
      time: nowTimestamp - 300000,
      acknowledged: false,
    },
  ];
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;

function formatOxygenTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildSeededOxygenHistory(nowTimestamp) {
  const points = 16; // every 20s across the last 5 minutes
  const stepMs = FIVE_MINUTES_MS / (points - 1);
  const series = [];

  for (let i = points - 1; i >= 0; i--) {
    const t = nowTimestamp - i * stepMs;
    const ripple = Math.sin((points - 1 - i) * 0.65) * 0.14;
    const oxygen =
      i === 0 ? 20.6 : Number(clamp(20.6 + ripple, 19.8, 21.2).toFixed(1));

    series.push({
      timestamp: t,
      time: formatOxygenTime(t),
      oxygen,
    });
  }

  return series;
}

const INITIAL_SEED_NOW = Date.now();

export function MineDataProvider({ children }) {
  const initialNow = INITIAL_SEED_NOW;
  const initialReadings = useMemo(() => buildBaselineReadings(false), []);
  const initialHistory = useMemo(
    () => buildSeededHistory(initialReadings, initialNow, false),
    [initialReadings, initialNow]
  );

  const [readings, setReadings] = useState(initialReadings);
  const [history, setHistory] = useState(initialHistory);
  const [timeline, setTimeline] = useState(() =>
    buildBaselineTimeline(initialNow)
  );
  const [alerts, setAlerts] = useState(() => buildDemoAlerts(initialNow));
  const [simulationActive, setSimulationActive] = useState(false);
  const [livePaused, setLivePaused] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const [environment, setEnvironment] = useState({
    oxygen: 20.6,
    humidity: 58.4,
    pressure: 1013.2,
    impact: false,
  });

  const [riskHistory, setRiskHistory] = useState(() =>
    buildSeededRiskHistory(initialReadings, initialHistory, initialNow)
  );
  const [oxygenHistory, setOxygenHistory] = useState(() =>
    buildSeededOxygenHistory(initialNow)
  );

  const [firebaseData, setFirebaseData] = useState({});
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    if (!database) {
      return undefined;
    }

    const sensorRef = ref(database, "SafeMine");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data !== null) {
          setFirebaseData(data);
          setFirebaseConnected(true);
        } else {
          setFirebaseData({});
          setFirebaseConnected(false);
        }
      },
      (error) => {
        console.warn("Firebase offline — using Demo Telemetry:", error.message);
        setFirebaseData({});
        setFirebaseConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const previousBandRef = useRef({
    "SM-003": SAFETY_BANDS.MODERATE,
    "SM-004": SAFETY_BANDS.CRITICAL,
  });
  const previousFactorKeysRef = useRef({});
  const previousUncertainRef = useRef({
    "SM-003": true,
    "SM-004": true,
  });

  const tick = useCallback(() => {
    if (livePaused && !simulationActive) {
      return;
    }

    const nextStageIndex = simulationActive
      ? Math.min(stageIndex + 1, STAGE_COUNT - 1)
      : stageIndex;

    const scenario = simulationActive ? getScenarioStage(nextStageIndex) : null;
    const timestamp = Date.now();
    const nextReadings = {};

    workersRoster.forEach((worker) => {
      const isScripted =
        scenario &&
        (worker.id === PRIMARY_WORKER_ID || worker.id === SECONDARY_WORKER_ID);

      if (isScripted) {
        nextReadings[worker.id] = {
          ...scenario[worker.id],
        };
        return;
      }

      const current = readings[worker.id];
      const baseline = DEMO_BASELINE_READINGS[worker.id];

      nextReadings[worker.id] = {
        gas: Number(
          clamp(meanRevert(current.gas, baseline.gas, 1.8), 5, 1500).toFixed(1)
        ),
        temperature: Number(
          clamp(
            meanRevert(current.temperature, baseline.temperature, 0.25),
            20,
            55
          ).toFixed(1)
        ),
        motion: Number(
          clamp(meanRevert(current.motion, baseline.motion, 0.02), 0, 1).toFixed(
            2
          )
        ),
        battery: Number(
          clamp(current.battery - Math.random() * 0.05, 5, 100).toFixed(0)
        ),
        signal: Number(
          clamp(meanRevert(current.signal, baseline.signal, 1.2), 20, 100).toFixed(
            0
          )
        ),
      };
    });

    // Update mine atmospheric telemetry (oxygen, humidity, pressure, impact)
    const maxMotion = Math.max(
      ...Object.values(nextReadings).map((r) => Number(r.motion || 0))
    );
    const oxygenTarget = simulationActive
      ? Math.max(18.6, 20.6 - nextStageIndex * 0.14)
      : 20.6;
    const humidityTarget = simulationActive
      ? Math.min(78, 58.4 + nextStageIndex * 1.1)
      : 58.4;

    const nextOxygen = Number(
      clamp(
        meanRevert(environment.oxygen, oxygenTarget, 0.08),
        17.5,
        22.0
      ).toFixed(1)
    );

    setEnvironment((prev) => ({
      oxygen: nextOxygen,
      humidity: Number(
        clamp(meanRevert(prev.humidity, humidityTarget, 0.6), 35, 90).toFixed(1)
      ),
      pressure: Number(
        clamp(meanRevert(prev.pressure, 1013.2, 0.35), 995, 1030).toFixed(1)
      ),
      impact: maxMotion >= 0.85,
    }));

    setOxygenHistory((current) => {
      const cutoff = timestamp - FIVE_MINUTES_MS;
      const next = [
        ...current,
        {
          timestamp,
          time: formatOxygenTime(timestamp),
          oxygen: nextOxygen,
        },
      ].filter((point) => point.timestamp >= cutoff);
      return next;
    });

    const nextHistory = {};
    workersRoster.forEach((worker) => {
      const existing = history[worker.id] || [];
      nextHistory[worker.id] = [
        ...existing,
        {
          ...nextReadings[worker.id],
          timestamp,
        },
      ].slice(-HISTORY_LIMIT);
    });

    const newAlerts = [];
    const timelineAdditions = {};

    const pushTimeline = (workerId, entry) => {
      timelineAdditions[workerId] = timelineAdditions[workerId] || [];
      timelineAdditions[workerId].push(entry);
    };

    let totalSafetyScore = 0;

    workersRoster.forEach((worker) => {
      const workerWithReading = {
        ...worker,
        ...nextReadings[worker.id],
      };

      const risk = computeWorkerRisk(workerWithReading, nextHistory[worker.id]);
      totalSafetyScore += risk.safetyScore;

      const previousBand =
        previousBandRef.current[worker.id] || SAFETY_BANDS.SAFE;
      const previousFactorKeys =
        previousFactorKeysRef.current[worker.id] || [];
      const currentFactorKeys = risk.factors.map((factor) => factor.key);

      const isUncertain = risk.isUncertain === true;
      const wasUncertain = previousUncertainRef.current[worker.id] || false;

      risk.factors
        .filter((factor) => !previousFactorKeys.includes(factor.key))
        .forEach((factor) => {
          pushTimeline(worker.id, {
            id: `${worker.id}-${timestamp}-${factor.key}`,
            time: timestamp,
            icon: risk.band === SAFETY_BANDS.CRITICAL ? "🔴" : "🟡",
            label: factor.reason,
          });
        });

      const newUncertainCondition = isUncertain && !wasUncertain;

      if (newUncertainCondition) {
        const alertType =
          risk.band === SAFETY_BANDS.CRITICAL
            ? "Critical"
            : risk.band === SAFETY_BANDS.HIGH
              ? "High"
              : "Warning";

        const alertTitle =
          risk.band === SAFETY_BANDS.CRITICAL
            ? "Critical safety condition"
            : risk.band === SAFETY_BANDS.HIGH
              ? "High risk condition detected"
              : "Elevated risk trend detected";

        const alert = {
          id: `ALT-${timestamp}-${worker.id}-uncertain`,
          kind: "predictive",
          type: alertType,
          title: alertTitle,
          message:
            risk.explanation[0] ||
            `${worker.name}'s sensor readings indicate an elevated safety condition.`,
          worker: worker.name,
          workerId: worker.id,
          zone: worker.zone,
          time: timestamp,
          acknowledged: false,
        };

        newAlerts.push(alert);
        pushTimeline(worker.id, {
          id: `${alert.id}-tl`,
          time: timestamp,
          icon:
            risk.band === SAFETY_BANDS.CRITICAL
              ? "🔴"
              : risk.band === SAFETY_BANDS.HIGH
                ? "🟠"
                : "🟡",
          label: alertTitle,
        });
      }

      if (
        risk.band === SAFETY_BANDS.CRITICAL &&
        previousBand !== SAFETY_BANDS.CRITICAL &&
        !newUncertainCondition
      ) {
        const alert = {
          id: `ALT-${timestamp}-${worker.id}-crit`,
          kind: "current",
          type: "Critical",
          title: risk.factors[0]?.label
            ? `Critical: ${risk.factors[0].label}`
            : "Critical safety threshold exceeded",
          message:
            risk.explanation.join(" ") || "Multiple safety thresholds exceeded.",
          worker: worker.name,
          workerId: worker.id,
          zone: worker.zone,
          time: timestamp,
          acknowledged: false,
        };

        newAlerts.push(alert);

        pushTimeline(worker.id, {
          id: `${alert.id}-tl-1`,
          time: timestamp,
          icon: "🔴",
          label: "Critical threshold exceeded",
        });
      }

      previousBandRef.current[worker.id] = risk.band;
      previousFactorKeysRef.current[worker.id] = currentFactorKeys;
      previousUncertainRef.current[worker.id] = isUncertain;
    });

    setReadings(nextReadings);
    setHistory(nextHistory);

    const averageSafetyScore = totalSafetyScore / workersRoster.length;

    setRiskHistory((current) => {
      const point = {
        time: new Date(timestamp).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        score: Number((averageSafetyScore / 10).toFixed(1)),
      };
      return [...current, point].slice(-20);
    });

    if (Object.keys(timelineAdditions).length > 0) {
      setTimeline((current) => {
        const merged = { ...current };
        Object.entries(timelineAdditions).forEach(([workerId, entries]) => {
          merged[workerId] = [...(current[workerId] || []), ...entries].slice(
            -TIMELINE_LIMIT
          );
        });
        return merged;
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((current) => [...newAlerts, ...current].slice(0, 40));
    }

    if (simulationActive) {
      setStageIndex(nextStageIndex);
    }
  }, [
    readings,
    history,
    environment.oxygen,
    simulationActive,
    stageIndex,
    livePaused,
  ]);

  useEffect(() => {
    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [tick]);

  const resetToBaseline = useCallback((forSimulation = false) => {
    const baseline = buildBaselineReadings(forSimulation);
    const timestamp = Date.now();
    const seededHistory = buildSeededHistory(baseline, timestamp, forSimulation);

    setReadings(baseline);
    setHistory(seededHistory);
    setTimeline(buildBaselineTimeline(timestamp));
    setAlerts(forSimulation ? [] : buildDemoAlerts(timestamp));
    setStageIndex(0);
    setEnvironment({
      oxygen: 20.6,
      humidity: 58.4,
      pressure: 1013.2,
      impact: false,
    });
    setRiskHistory(buildSeededRiskHistory(baseline, seededHistory, timestamp));
    setOxygenHistory(buildSeededOxygenHistory(timestamp));

    previousBandRef.current = forSimulation
      ? {}
      : {
          "SM-003": SAFETY_BANDS.MODERATE,
          "SM-004": SAFETY_BANDS.CRITICAL,
        };
    previousFactorKeysRef.current = {};
    previousUncertainRef.current = forSimulation
      ? {}
      : {
          "SM-003": true,
          "SM-004": true,
        };
  }, []);

  const startSimulation = useCallback(() => {
    resetToBaseline(true);
    setLivePaused(false);
    setSimulationActive(true);
  }, [resetToBaseline]);

  const stopSimulation = useCallback(() => {
    setSimulationActive(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationActive(false);
    resetToBaseline(false);
  }, [resetToBaseline]);

  const toggleLivePaused = useCallback(() => {
    setLivePaused((prev) => !prev);
  }, []);

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const enrichedWorkers = useMemo(
    () =>
      workersRoster.map((worker) => {
        const workerWithReading = {
          ...worker,
          ...readings[worker.id],
        };
        const risk = computeWorkerRisk(
          workerWithReading,
          history[worker.id] || []
        );
        return {
          ...workerWithReading,
          ...risk,
        };
      }),
    [readings, history]
  );

  const zones = useMemo(
    () =>
      zonesRoster.map((zone) => {
        const zoneWorkers = enrichedWorkers.filter(
          (worker) => worker.zone === zone.id
        );
        return {
          ...zone,
          ...computeZoneRisk(zone.id, zoneWorkers),
        };
      }),
    [enrichedWorkers]
  );

  const statistics = useMemo(() => {
    const sortedByRisk = [...enrichedWorkers].sort(
      (a, b) => b.safetyScore - a.safetyScore
    );
    const sortedZonesByRisk = [...zones].sort(
      (a, b) => b.safetyScore - a.safetyScore
    );

    const averageSafetyScore =
      enrichedWorkers.length > 0
        ? enrichedWorkers.reduce(
            (total, worker) => total + worker.safetyScore,
            0
          ) / enrichedWorkers.length
        : 0;

    return {
      totalWorkers: enrichedWorkers.length,
      safeWorkers: enrichedWorkers.filter((worker) => worker.status === "Safe")
        .length,
      atRiskWorkers: enrichedWorkers.filter(
        (worker) => worker.status === "Warning"
      ).length,
      criticalWorkers: enrichedWorkers.filter(
        (worker) => worker.status === "Critical"
      ).length,
      activeAlerts: alerts.filter((alert) => !alert.acknowledged).length,
      highRiskZones: zones.filter(
        (zone) =>
          zone.band === SAFETY_BANDS.HIGH ||
          zone.band === SAFETY_BANDS.CRITICAL ||
          zone.hazardDetected
      ).length,
      highestRiskWorker: sortedByRisk[0] || null,
      highestRiskZone: sortedZonesByRisk[0] || null,
      overallSafetyScore: Math.round(averageSafetyScore),
      overallRiskScore: Number((averageSafetyScore / 10).toFixed(1)),
      overallBand: getBandFromScore(averageSafetyScore),
    };
  }, [enrichedWorkers, zones, alerts]);

  const value = useMemo(
    () => ({
      firebase: {
        connected: firebaseConnected,
        data: firebaseData,
        path: "SafeMine",
        demoMode: !firebaseConnected,
      },
      environment,
      livePaused,
      toggleLivePaused,
      workers: enrichedWorkers,
      zones,
      alerts,
      history,
      timeline,
      riskHistory,
      oxygenHistory,
      statistics,
      simulation: {
        active: simulationActive,
        stage: stageIndex,
        stageCount: STAGE_COUNT,
        isFinalStage: isFinalStage(stageIndex),
      },
      startSimulation,
      stopSimulation,
      resetSimulation,
      acknowledgeAlert,
    }),
    [
      firebaseData,
      firebaseConnected,
      environment,
      livePaused,
      toggleLivePaused,
      enrichedWorkers,
      zones,
      alerts,
      history,
      timeline,
      riskHistory,
      oxygenHistory,
      statistics,
      simulationActive,
      stageIndex,
      startSimulation,
      stopSimulation,
      resetSimulation,
      acknowledgeAlert,
    ]
  );

  return (
    <MineDataContext.Provider value={value}>
      {children}
    </MineDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMineContext() {
  const context = useContext(MineDataContext);
  if (!context) {
    throw new Error("useMineContext must be used within a MineDataProvider");
  }
  return context;
}