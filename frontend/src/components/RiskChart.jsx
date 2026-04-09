import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RiskChart = ({ data }) => {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 text-red-400">Risk Score Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              border: '1px solid #1e293b',
              borderRadius: '8px',
              color: '#e2e8f0'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskChart;
