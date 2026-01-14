
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GrowthChartProps {
  data: { day: number; followers: number; reactions: number }[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[400px] glass p-6 rounded-2xl">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></span>
        Projected Growth Simulation
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorReactions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="day" 
            stroke="#94a3b8" 
            label={{ value: 'Simulation Day', position: 'insideBottom', offset: -5, fill: '#94a3b8' }} 
          />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="top" height={36}/>
          <Area 
            type="monotone" 
            dataKey="followers" 
            stroke="#818cf8" 
            fillOpacity={1} 
            fill="url(#colorFollowers)" 
            name="Simulated Followers"
          />
          <Area 
            type="monotone" 
            dataKey="reactions" 
            stroke="#22d3ee" 
            fillOpacity={1} 
            fill="url(#colorReactions)" 
            name="Simulated Reactions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
