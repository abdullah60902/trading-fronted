import React from 'react';
import CoinChart from '@/components/CoinChart';
import { TrendingUp, Activity, BarChart2 } from 'lucide-react';

export default function ChartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Live Market Charts</h1>
        <p className="text-gray-500 dark:text-gray-400">Track real-time cryptocurrency prices and market trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Market Trend</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">Bullish</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">$42.5B</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Market Dominance</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">BTC 54%</p>
          </div>
        </div>
      </div>

      <CoinChart />
    </div>
  );
}
