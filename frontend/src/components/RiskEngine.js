export const calculateRiskScore = (heartRate, temperature, hrv) => {
  let riskScore = 0;

  if (heartRate > 100) {
    riskScore += 30;
  }

  if (temperature > 37.5) {
    riskScore += 30;
  }

  if (hrv < 30) {
    riskScore += 40;
  }

  return Math.min(riskScore, 100);
};

export const getRiskCategory = (riskScore) => {
  if (riskScore <= 30) {
    return { label: 'Normal', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
  } else if (riskScore <= 60) {
    return { label: 'Moderate Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
  } else {
    return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
  }
};

export const getHealthAlerts = (heartRate, temperature, hrv, riskScore) => {
  const alerts = [];

  if (heartRate > 100) {
    alerts.push('⚠ Elevated cardiovascular stress detected.');
  }

  if (temperature > 37.5) {
    alerts.push('⚠ Body temperature above normal range.');
  }

  if (hrv < 30) {
    alerts.push('⚠ Low heart rate variability - possible stress or fatigue.');
  }

  if (riskScore > 60) {
    alerts.push('⚠ High risk detected - consider medical consultation.');
  }

  return alerts;
};
