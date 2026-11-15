// SafeMine explainable risk-prediction engine.
//
// Combines live threshold checks (gas, temperature, motion, battery, signal)
// with short-window trend analysis to produce a continuous 0–100 risk score
// and actionable factor explanations.

export const SAFETY_BANDS = {
  SAFE: "SAFE",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export const DEFAULT_THRESHOLDS = {
  bands: {
    safe: 30,
    moderate: 60,
    high: 80,
  },

  sensors: {
    gas: 50,
    gasWarning: 35,
    temperature: 38,
    temperatureCritical: 42,
    motion: 0.5,
    batteryLow: 30,
    signalWeak: 70,
  },

  factors: {
    gasHigh: {
      points: 45,
      value: 50,
      label: "High gas level",
    },
    temperatureHigh: {
      points: 30,
      value: 38,
      label: "High temperature",
    },
  },
};

export function getBandFromScore(
  score,
  thresholds = DEFAULT_THRESHOLDS
) {
  if (score >= thresholds.bands.high) {
    return SAFETY_BANDS.CRITICAL;
  }

  if (score >= thresholds.bands.moderate) {
    return SAFETY_BANDS.HIGH;
  }

  if (score >= thresholds.bands.safe) {
    return SAFETY_BANDS.MODERATE;
  }

  return SAFETY_BANDS.SAFE;
}

export function getBandStyle(band) {
  switch (band) {
    case SAFETY_BANDS.CRITICAL:
      return {
        text: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
        dot: "bg-red-400",
      };

    case SAFETY_BANDS.HIGH:
      return {
        text: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20",
        dot: "bg-orange-400",
      };

    case SAFETY_BANDS.MODERATE:
      return {
        text: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
        dot: "bg-amber-400",
      };

    default:
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
        dot: "bg-emerald-400",
      };
  }
}

export function getLegacyStatus(band) {
  if (band === SAFETY_BANDS.CRITICAL) {
    return "Critical";
  }

  if (
    band === SAFETY_BANDS.HIGH ||
    band === SAFETY_BANDS.MODERATE
  ) {
    return "Warning";
  }

  return "Safe";
}

export function analyzeTrend(history = [], key) {
  const values = history
    .map((reading) => reading?.[key])
    .filter((value) => typeof value === "number");

  if (values.length < 2) {
    return {
      direction: "stable",
      changePercent: 0,
      current: values[0] ?? null,
      previous: null,
    };
  }

  const current = values[values.length - 1];
  const previous = values[0];

  if (previous === 0) {
    return {
      direction: "stable",
      changePercent: 0,
      current,
      previous,
    };
  }

  const changePercent =
    ((current - previous) / Math.abs(previous)) * 100;

  let direction = "stable";

  if (changePercent > 5) {
    direction = "increasing";
  } else if (changePercent < -5) {
    direction = "decreasing";
  }

  return {
    direction,
    changePercent,
    current,
    previous,
  };
}

export function computeWorkerRisk(
  worker,
  history = [],
  thresholds = DEFAULT_THRESHOLDS
) {
  const gasTrend = analyzeTrend(history, "gas");
  const tempTrend = analyzeTrend(history, "temperature");

  const factors = [];

  const gasLimit = thresholds.sensors.gas;
  const gasWarning = thresholds.sensors.gasWarning ?? 35;
  const tempLimit = thresholds.sensors.temperature;
  const motionLimit = thresholds.sensors.motion ?? 0.5;
  const batteryLow = thresholds.sensors.batteryLow ?? 30;
  const signalWeak = thresholds.sensors.signalWeak ?? 70;

  const gas = typeof worker.gas === "number" ? worker.gas : 0;
  const temp = typeof worker.temperature === "number" ? worker.temperature : 30;
  const motion = typeof worker.motion === "number" ? worker.motion : 0;
  const battery = typeof worker.battery === "number" ? worker.battery : 100;
  const signal = typeof worker.signal === "number" ? worker.signal : 100;

  // Baseline environmental exposure (gives realistic ~12–24 score in safe state)
  let baseScore =
    Math.min(12, (gas / gasLimit) * 18) +
    Math.min(8, Math.max(0, (temp - 28) * 0.8)) +
    Math.min(4, motion * 10);

  // Gas threshold & trend
  if (gas > gasLimit) {
    factors.push({
      key: "gasRising",
      label: "Critical gas level",
      points: 42,
      reason: `Gas concentration is ${gas.toFixed(1)} ppm, above the ${gasLimit} ppm safety limit.`,
    });
  } else if (gas > gasWarning || gasTrend.direction === "increasing") {
    factors.push({
      key: "gasRising",
      label: "Elevated gas trend",
      points: 20,
      reason:
        gas > gasWarning
          ? `Gas level (${gas.toFixed(1)} ppm) is approaching the ${gasLimit} ppm limit.`
          : `Gas concentration increased ${gasTrend.changePercent.toFixed(0)}% over recent readings.`,
    });
  }

  // Temperature threshold & trend
  if (temp > (thresholds.sensors.temperatureCritical ?? 42)) {
    factors.push({
      key: "tempRising",
      label: "High temperature",
      points: 28,
      reason: `Ambient temperature is ${temp.toFixed(1)}°C, exceeding safe thermal limit.`,
    });
  } else if (temp > tempLimit || tempTrend.direction === "increasing") {
    factors.push({
      key: "tempRising",
      label: "Rising temperature",
      points: 16,
      reason:
        temp > tempLimit
          ? `Temperature (${temp.toFixed(1)}°C) is above the ${tempLimit}°C advisory threshold.`
          : `Temperature increased ${tempTrend.changePercent.toFixed(0)}% over recent readings.`,
    });
  }

  // Abnormal motion / fall detection
  if (motion > motionLimit) {
    factors.push({
      key: "abnormalMotion",
      label: "Abnormal motion",
      points: 20,
      reason: `Motion spike (${motion.toFixed(2)}g) indicates possible slip, fall, or impact.`,
    });
  }

  // Low helmet battery
  if (battery < batteryLow) {
    factors.push({
      key: "lowBattery",
      label: "Low helmet battery",
      points: 10,
      reason: `Smart helmet battery is at ${Math.round(battery)}% (below ${batteryLow}%).`,
    });
  }

  // Weak LoRa signal
  if (signal < signalWeak) {
    factors.push({
      key: "weakSignal",
      label: "Weak LoRa signal",
      points: 10,
      reason: `Helmet telemetry signal dropped to ${Math.round(signal)}% (below ${signalWeak}%).`,
    });
  }

  const factorPoints = factors.reduce(
    (total, factor) => total + factor.points,
    0
  );

  const safetyScore = Math.min(
    100,
    Math.round(baseScore + factorPoints)
  );

  const band = getBandFromScore(safetyScore, thresholds);

  const hasSevereFactor = factors.some(
    (f) =>
      f.key === "gasRising" ||
      f.key === "tempRising" ||
      f.key === "abnormalMotion"
  );

  return {
    safetyScore,
    band,
    riskScore: Number((safetyScore / 10).toFixed(1)),
    status: getLegacyStatus(band),
    factors,
    trend: {
      gas: gasTrend,
      temperature: tempTrend,
    },
    explanation: factors.map((factor) => factor.reason),
    isUncertain: hasSevereFactor && safetyScore >= 35,
  };
}

export function computeZoneRisk(zoneId, zoneWorkers = []) {
  const safeCount = zoneWorkers.filter(
    (worker) => worker.status === "Safe"
  ).length;

  const warningCount = zoneWorkers.filter(
    (worker) => worker.status === "Warning"
  ).length;

  const criticalCount = zoneWorkers.filter(
    (worker) => worker.status === "Critical"
  ).length;

  const offlineCount = zoneWorkers.filter(
    (worker) => worker.status === "Offline"
  ).length;

  const workerCount = zoneWorkers.length;

  const avgGas =
    workerCount > 0
      ? zoneWorkers.reduce(
          (total, worker) => total + (worker.gas || 0),
          0
        ) / workerCount
      : 0;

  const avgTemperature =
    workerCount > 0
      ? zoneWorkers.reduce(
          (total, worker) => total + (worker.temperature || 0),
          0
        ) / workerCount
      : 0;

  const avgSafetyScore =
    workerCount > 0
      ? zoneWorkers.reduce(
          (total, worker) => total + (worker.safetyScore || 0),
          0
        ) / workerCount
      : 0;

  const uncertainWorkers = zoneWorkers.filter(
    (worker) => worker.isUncertain === true
  );

  const hazardDetected =
    uncertainWorkers.length >= 2 || criticalCount >= 1;

  return {
    zoneId,
    workerCount,
    safeCount,
    warningCount,
    criticalCount,
    offlineCount,
    avgGas: Number(avgGas.toFixed(1)),
    avgTemperature: Number(avgTemperature.toFixed(1)),
    safetyScore: Math.round(avgSafetyScore),
    band: getBandFromScore(avgSafetyScore),
    hazardDetected,
    hazardReason: hazardDetected
      ? criticalCount >= 1
        ? `Critical telemetry detected in ${zoneId} — ${uncertainWorkers.length} worker${uncertainWorkers.length === 1 ? "" : "s"} reporting elevated gas, thermal, or motion readings.`
        : `Potential Environmental Hazard Detected in ${zoneId} — ${uncertainWorkers.length} workers have readings above advisory thresholds.`
      : null,
  };
}