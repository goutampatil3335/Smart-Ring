import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HeartRateChart = ({ data }) => {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 text-cyan-400">Heart Rate Trend</h3>
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
            domain={[50, 130]}
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
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeartRateChart;
