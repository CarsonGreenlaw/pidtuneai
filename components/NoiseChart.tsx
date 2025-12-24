'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface NoiseData {
  axis: string;
  peak_freq_hz: number;
  peak_amplitude: number;
}

interface NoiseChartProps {
  data: Record<string, { peak_freq_hz: number; peak_amplitude: number }>;
}

export default function NoiseChart({ data }: NoiseChartProps) {
  const chartData = Object.entries(data).map(([axis, val]) => ({
    axis: axis.toUpperCase(),
    freq: val.peak_freq_hz,
    amp: val.peak_amplitude,
  }));

  return (
    <div className="hud-panel p-6 rounded-lg w-full h-[400px]">
      <h3 className="text-[#00f3ff] font-mono text-xl mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-[#00f3ff] rounded-full inline-block animate-pulse"></span>
        NOISE SPECTRUM PEAKS
      </h3>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
            <XAxis type="number" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis 
                dataKey="axis" 
                type="category" 
                stroke="#666" 
                tick={{ fill: '#fff', fontWeight: 'bold' }} 
                width={50}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#00f3ff' }}
                itemStyle={{ color: '#00f3ff' }}
                cursor={{ fill: 'rgba(0, 243, 255, 0.1)' }}
            />
            <Bar dataKey="amp" name="Amplitude" fill="#00f3ff" barSize={20}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amp > 10 ? '#ff0099' : '#00f3ff'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 text-xs font-mono text-gray-500 justify-center mt-2">
         <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00f3ff] rounded-full"></span> NORMAL</span>
         <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#ff0099] rounded-full"></span> HIGH NOISE</span>
      </div>
    </div>
  );
}
