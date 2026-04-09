import { useState, useEffect } from 'react';
import { generateSensorData } from '../utils/patientProfiles';

export const useSensorSimulator = (profileType = 'healthy') => {
  const [sensorData, setSensorData] = useState(() => generateSensorData(profileType));

  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(generateSensorData(profileType));
    }, 3000);

    return () => clearInterval(interval);
  }, [profileType]);

  return sensorData;
};
