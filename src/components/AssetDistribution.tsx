import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AssetDistributionProps {
  assets: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AssetDistribution: React.FC<AssetDistributionProps> = ({ assets }) => {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="mt-6">
      <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Distribuzione degli Asset</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={assets}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {assets.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value.toFixed(2)} (${((value / totalValue) * 100).toFixed(2)}%)`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetDistribution;