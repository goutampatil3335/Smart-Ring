export const PATIENT_PROFILES = {
  healthy: {
    label: 'Healthy Patient',
    description: 'Normal physiological parameters',
    icon: '💚',
    heartRate: { min: 60, max: 85 },
    temperature: { min: 36.0, max: 37.2 },
    hrv: { min: 45, max: 70 },
    color: 'green'
  },
  diabetic: {
    label: 'Diabetic Patient',
    description: 'Elevated temperature and heart rate tendencies',
    icon: '🩺',
    heartRate: { min: 75, max: 110 },
    temperature: { min: 36.8, max: 38.2 },
    hrv: { min: 25, max: 55 },
    color: 'yellow'
  },
  cardiac: {
    label: 'Cardiac Patient',
    description: 'Low HRV and irregular heart rate patterns',
    icon: '❤️',
    heartRate: { min: 65, max: 120 },
    temperature: { min: 36.0, max: 37.5 },
    hrv: { min: 20, max: 40 },
    color: 'red'
  }
};

export const generateSensorData = (profileType) => {
  const profile = PATIENT_PROFILES[profileType] || PATIENT_PROFILES.healthy;
  
  return {
    heartRate: Math.floor(
      Math.random() * (profile.heartRate.max - profile.heartRate.min + 1) + profile.heartRate.min
    ),
    temperature: (
      Math.random() * (profile.temperature.max - profile.temperature.min) + profile.temperature.min
    ).toFixed(1),
    hrv: Math.floor(
      Math.random() * (profile.hrv.max - profile.hrv.min + 1) + profile.hrv.min
    ),
    timestamp: Date.now()
  };
};
