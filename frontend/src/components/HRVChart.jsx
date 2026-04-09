import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HRVChart = ({ data }) => {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-4 text-purple-400">HRV Trend</h3>
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
            domain={[10, 80]}
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
            stroke="#a855f7" 
            strokeWidth={2}
            dot={{ fill: '#a855f7', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HRVChart;
