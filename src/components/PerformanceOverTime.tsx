import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceData {
  date: string;
  value: number;
}

interface PerformanceOverTimeProps {
  data: PerformanceData[];
}

const PerformanceOverTime: React.FC<PerformanceOverTimeProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>Nessun dato di performance disponibile.</div>;
  }

  const initialValue = data[0]?.value ?? 0;
  const performanceData = data.map(item => ({
    ...item,
    performance: item.value !== undefined ? ((item.value - initialValue) / initialValue) * 100 : 0
  }));

  return (
    <div className="mt-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Rendimento nel Tempo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Rendimento (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
          <Line type="monotone" dataKey="performance" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceOverTime;