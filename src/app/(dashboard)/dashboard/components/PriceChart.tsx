"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockData = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: 60000 + Math.random() * 5000 + (i * 200),
  };
});

export default function PriceChart({ liveRates, coinsData }: { liveRates?: Record<string, number>, coinsData?: any[] }) {
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [data, setData] = useState(mockData);
  const [priceChange, setPriceChange] = useState(2.4);
  const isPositive = priceChange >= 0;

  const availableCoins = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDT', name: 'Tether' },
  ];

  // Sync real chart data from CoinGecko API sparkline
  useEffect(() => {
    if (coinsData && coinsData.length > 0) {
      const coin = coinsData.find((c: any) => c.symbol.toLowerCase() === selectedCoin.toLowerCase()) || coinsData[0];
      if (coin && coin.sparkline_in_7d && coin.sparkline_in_7d.price) {
        setPriceChange(coin.price_change_percentage_24h || 0);
        
        // Convert sparkline array to chart data format
        const realData = coin.sparkline_in_7d.price.map((p: number, index: number) => {
          const date = new Date();
          // Sparkline usually has 168 hours (7 days) of data
          date.setHours(date.getHours() - (coin.sparkline_in_7d.price.length - index));
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' }),
            price: p,
          };
        });
        
        // Take the last 30 points for better visibility if it's too squished, or just use all
        setData(realData);
      }
    }
  }, [coinsData, selectedCoin]);

  const currentPrice = liveRates ? liveRates[selectedCoin] : undefined;

  // Update chart data when currentPrice prop changes
  useEffect(() => {
    if (currentPrice) {
      setData((currentData) => {
        const newData = [...currentData];
        newData[newData.length - 1] = {
          ...newData[newData.length - 1],
          price: currentPrice,
        };
        return newData;
      });
    }
  }, [currentPrice]);

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {availableCoins.map(c => (
              <button 
                key={c.symbol}
                onClick={() => setSelectedCoin(c.symbol)}
                className={`px-3 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                  selectedCoin === c.symbol 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {c.symbol}
              </button>
            ))}
          </div>
          <h3 className="text-slate-400 font-medium mb-1">
            {availableCoins.find(c => c.symbol === selectedCoin)?.name} ({selectedCoin}) Live Price
          </h3>
          <div className="flex items-end space-x-3">
            <span className="text-3xl font-bold text-slate-100">
              ${(currentPrice || data[data.length - 1].price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`flex items-center text-sm font-medium mb-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(priceChange)}%
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {['1H', '1D', '1W', '1M', '1Y'].map((tf) => (
            <button key={tf} className={`px-3 py-1 rounded text-xs font-medium ${tf === '1M' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#334155" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis domain={['auto', 'auto']} stroke="#334155" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value: any) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
            />
            <Area type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
