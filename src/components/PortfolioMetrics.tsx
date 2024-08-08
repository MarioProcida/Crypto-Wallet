import React from 'react';

interface PortfolioMetricsProps {
  totalValue: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
}

const PortfolioMetrics: React.FC<PortfolioMetricsProps> = ({ totalValue, dailyChange, weeklyChange, monthlyChange }) => {
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valore Totale</h4>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">${totalValue.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Variazione Giornaliera</h4>
        <p className={`text-lg font-semibold ${dailyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {dailyChange !== undefined ? `${dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)}%` : 'N/A'}
        </p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Variazione Settimanale</h4>
        <p className={`text-lg font-semibold ${weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {weeklyChange !== undefined ? `${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(2)}%` : 'N/A'}
        </p>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Variazione Mensile</h4>
        <p className={`text-lg font-semibold ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {monthlyChange !== undefined ? `${monthlyChange >= 0 ? '+' : ''}${monthlyChange.toFixed(2)}%` : 'N/A'}
        </p>
      </div>
    </div>
  );
};

export default PortfolioMetrics;