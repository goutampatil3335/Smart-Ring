import { useState, useEffect } from 'react';
import { useSensorSimulator } from './SensorSimulator';
import { calculateRiskScore, getRiskCategory, getHealthAlerts } from './RiskEngine';
import HeartRateChart from './HeartRateChart';
import TemperatureChart from './TemperatureChart';
import HRVChart from './HRVChart';
import RiskChart from './RiskChart';
import { Activity, Thermometer, Heart, AlertTriangle, LogOut, FileText, User, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PATIENT_PROFILES } from '../utils/patientProfiles';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState('healthy');
  const [showHistorical, setShowHistorical] = useState(false);
  const sensorData = useSensorSimulator(selectedProfile);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [hrvHistory, setHrvHistory] = useState([]);
  const [riskHistory, setRiskHistory] = useState([]);
  const [sessionData, setSessionData] = useState({
    totalReadings: 0,
    avgHeartRate: 0,
    avgTemperature: 0,
    avgHrv: 0,
    avgRiskScore: 0,
    maxRiskScore: 0,
    totalAlerts: 0
  });

  const heartRate = parseFloat(sensorData.heartRate);
  const temperature = parseFloat(sensorData.temperature);
  const hrv = parseFloat(sensorData.hrv);

  const riskScore = calculateRiskScore(heartRate, temperature, hrv);
  const riskCategory = getRiskCategory(riskScore);
  const alerts = getHealthAlerts(heartRate, temperature, hrv, riskScore);

  useEffect(() => {
    const time = new Date(sensorData.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newHeartRateEntry = { time, value: heartRate, heartRate };
    const newTempEntry = { time, value: temperature, temperature };
    const newHrvEntry = { time, value: hrv, hrv };
    const newRiskEntry = { time, value: riskScore, riskScore };

    setHeartRateHistory(prev => [...prev.slice(-19), newHeartRateEntry]);
    setTemperatureHistory(prev => [...prev.slice(-19), newTempEntry]);
    setHrvHistory(prev => [...prev.slice(-19), newHrvEntry]);
    setRiskHistory(prev => [...prev.slice(-19), newRiskEntry]);

    setSessionData(prev => {
      const newTotal = prev.totalReadings + 1;
      return {
        totalReadings: newTotal,
        avgHeartRate: ((prev.avgHeartRate * prev.totalReadings) + heartRate) / newTotal,
        avgTemperature: ((prev.avgTemperature * prev.totalReadings) + temperature) / newTotal,
        avgHrv: ((prev.avgHrv * prev.totalReadings) + hrv) / newTotal,
        avgRiskScore: ((prev.avgRiskScore * prev.totalReadings) + riskScore) / newTotal,
        maxRiskScore: Math.max(prev.maxRiskScore, riskScore),
        totalAlerts: prev.totalAlerts + (alerts.length > 0 ? 1 : 0)
      };
    });
  }, [sensorData, heartRate, temperature, hrv, riskScore, alerts.length]);

  const handleSaveSession = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post(`${API}/health-records`, {
        date: today,
        avg_heart_rate: sessionData.avgHeartRate,
        avg_temperature: sessionData.avgTemperature,
        avg_hrv: sessionData.avgHrv,
        avg_risk_score: sessionData.avgRiskScore,
        max_risk_score: sessionData.maxRiskScore,
        total_alerts: sessionData.totalAlerts,
        profile_type: PATIENT_PROFILES[selectedProfile].label
      });
      alert('Session data saved successfully!');
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session data');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Smart Ring Health Monitor</h1>
                <p className="text-sm text-slate-400">Population-Specific Early Disease Detection</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-white text-sm">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 transition-all"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Profile Selector & Actions */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-300">Patient Profile:</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              data-testid="profile-selector"
            >
              {Object.entries(PATIENT_PROFILES).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.icon} {profile.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 max-w-xs">
              {PATIENT_PROFILES[selectedProfile].description}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistorical(!showHistorical)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 transition-all"
              data-testid="toggle-historical-button"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">{showHistorical ? 'Hide' : 'Show'} Historical</span>
            </button>
            <button
              onClick={handleSaveSession}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 transition-all"
              data-testid="save-session-button"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Save Session</span>
            </button>
          </div>
        </div>

        
        {/* Sensor Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Heart Rate Card */}
          <div className="sensor-card" data-testid="heart-rate-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-slate-300">Heart Rate</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white" data-testid="heart-rate-value">{heartRate}</span>
              <span className="text-slate-400 text-sm">bpm</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Normal: 60-100 bpm</div>
          </div>

          {/* Temperature Card */}
          <div className="sensor-card" data-testid="temperature-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium text-slate-300">Temperature</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white" data-testid="temperature-value">{temperature}</span>
              <span className="text-slate-400 text-sm">°C</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Normal: 36-37.5 °C</div>
          </div>

          {/* HRV Card */}
          <div className="sensor-card" data-testid="hrv-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-slate-300">HRV</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white" data-testid="hrv-value">{hrv}</span>
              <span className="text-slate-400 text-sm">ms</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Normal: &gt;30 ms</div>
          </div>

          {/* Risk Score Card */}
          <div className="sensor-card border-2" data-testid="risk-score-card" style={{ borderColor: riskCategory.color.replace('text-', '#') }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${riskCategory.color}`} />
                <span className="text-sm font-medium text-slate-300">Risk Score</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white" data-testid="risk-score-value">{riskScore}</span>
              <span className="text-slate-400 text-sm">/100</span>
            </div>
            <div className={`mt-3 px-3 py-1 rounded-full ${riskCategory.bg} ${riskCategory.border} border inline-block`}>
              <span className={`text-xs font-semibold ${riskCategory.color}`} data-testid="risk-status">{riskCategory.label}</span>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        {alerts.length > 0 && (
          <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded-xl backdrop-blur-sm" data-testid="alerts-panel">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-red-400">Health Alerts</h3>
            </div>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="text-slate-300 text-sm" data-testid={`alert-${index}`}>{alert}</div>
              ))}
            </div>
          </div>
        )}

        {/* Health Trend Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="chart-wrapper" data-testid="heart-rate-chart">
            <HeartRateChart data={heartRateHistory} />
          </div>
          <div className="chart-wrapper" data-testid="temperature-chart">
            <TemperatureChart data={temperatureHistory} />
          </div>
          <div className="chart-wrapper" data-testid="hrv-chart">
            <HRVChart data={hrvHistory} />
          </div>
          <div className="chart-wrapper" data-testid="risk-chart">
            <RiskChart data={riskHistory} />
          </div>
        </div>

        {/* System Flow Info */}
        <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-xl backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">System Architecture Flow</h3>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">Sensor Simulation</span>
            <span className="text-slate-600">→</span>
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">Data Processing</span>
            <span className="text-slate-600">→</span>
            <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400">Risk Prediction</span>
            <span className="text-slate-600">→</span>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">Dashboard</span>
            <span className="text-slate-600">→</span>
            <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">Alerts</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
