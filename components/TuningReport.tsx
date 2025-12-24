'use client';

import { useState } from 'react';
import { Terminal, Sliders, Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface PID {
  p: number;
  i: number;
  d: number;
}

interface Filter {
  type: string;
  axis: string;
  center_hz: number;
  cutoff_hz: number;
}

interface Recommendations {
  pids: {
    roll: PID;
    pitch: PID;
    yaw: PID;
  };
  filters: Filter[];
  filter_slider: number;
}

interface TuningReportProps {
  recommendations: Recommendations;
}

export default function TuningReport({ recommendations }: TuningReportProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'cli'>('manual');
  const [copied, setCopied] = useState(false);

  const generateCLI = () => {
    let cli = `# PIDTUNEAI Generated Profile for Betaflight 4.5.2\n\n`;
    
    // Scale 0.6 to 60 for the 10-200 range
    const multPercent = (recommendations.filter_slider * 100).toFixed(0);

    // Filters
    cli += `# Simplified Filter Multipliers\n`;
    cli += `set simplified_gyro_filter_multiplier = ${multPercent}\n`;
    cli += `set simplified_dterm_filter_multiplier = ${multPercent}\n\n`;

    // PIDs
    cli += `set p_pitch = ${recommendations.pids.pitch.p}\n`;
    cli += `set i_pitch = ${recommendations.pids.pitch.i}\n`;
    cli += `set d_pitch = ${recommendations.pids.pitch.d}\n\n`;
    
    cli += `set p_roll = ${recommendations.pids.roll.p}\n`;
    cli += `set i_roll = ${recommendations.pids.roll.i}\n`;
    cli += `set d_roll = ${recommendations.pids.roll.d}\n\n`;
    
    cli += `set p_yaw = ${recommendations.pids.yaw.p}\n`;
    cli += `set i_yaw = ${recommendations.pids.yaw.i}\n`;
    cli += `set d_yaw = ${recommendations.pids.yaw.d}\n\n`;

    // Filters
    if (recommendations.filters.length > 0) {
        cli += `# Suggested Notch Filters\n`;
        recommendations.filters.forEach((f, i) => {
            const index = i + 1; // 1-based index for filter slots? simplified logic
            // In reality BF has set gyro_notch_1_hz etc.
            // Simplified for prototype:
            cli += `# ${f.type.toUpperCase()} on ${f.axis.toUpperCase()}: Center ${f.center_hz}Hz, Cutoff ${f.cutoff_hz}Hz\n`;
        });
    }

    cli += `save\n`;
    return cli;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCLI());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hud-panel p-6 rounded-lg w-full mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#00f3ff] font-mono text-xl flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00ff66] rounded-full inline-block animate-pulse"></span>
          TUNING RECOMMENDATIONS
        </h3>
        <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-gray-700">
            <button 
                onClick={() => setActiveTab('manual')}
                className={clsx("px-4 py-1.5 rounded text-sm font-mono transition-colors flex items-center gap-2", activeTab === 'manual' ? "bg-[#00f3ff]/20 text-[#00f3ff]" : "text-gray-400 hover:text-white")}
            >
                <Sliders className="w-4 h-4" /> MANUAL
            </button>
            <button 
                onClick={() => setActiveTab('cli')}
                className={clsx("px-4 py-1.5 rounded text-sm font-mono transition-colors flex items-center gap-2", activeTab === 'cli' ? "bg-[#00f3ff]/20 text-[#00f3ff]" : "text-gray-400 hover:text-white")}
            >
                <Terminal className="w-4 h-4" /> CLI
            </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <div className="space-y-8">
            {/* Filter Slider Section */}
            <div className="bg-black/30 p-6 rounded border border-gray-800">
                <h4 className="text-[#00f3ff] uppercase font-mono mb-6 text-sm tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full"></span>
                    Filter Settings (Betaflight 4.3+ Sliders)
                </h4>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mb-1 uppercase tracking-widest">
                        <span>More Filtering</span>
                        <span>Less Filtering</span>
                    </div>
                    <div className="relative h-6 bg-black/60 rounded-lg border border-gray-800 overflow-hidden">
                        {/* Center Marker */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-700 z-0"></div>
                        
                        {/* Gradient Progress */}
                        <div 
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-500/20 to-[#00f3ff]/40 transition-all duration-700"
                            style={{ width: `${((recommendations.filter_slider - 0.5) / 1.0) * 100}%` }}
                        ></div>
                        
                        {/* Slider Handle Visual */}
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-[#00f3ff] shadow-[0_0_15px_#00f3ff] transition-all duration-700 z-10"
                            style={{ left: `${((recommendations.filter_slider - 0.5) / 1.0) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2 px-1">
                         <span className="text-[10px] text-gray-600 font-mono">0.5</span>
                         <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white font-mono">{recommendations.filter_slider.toFixed(2)}</span>
                                <span className="text-[10px] text-[#00f3ff] font-mono font-bold">×</span>
                            </div>
                            <span className="text-[9px] text-gray-500 uppercase tracking-tighter">Master Multiplier</span>
                         </div>
                         <span className="text-[10px] text-gray-600 font-mono">1.5</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['roll', 'pitch', 'yaw'].map((axis) => {
                const pid = recommendations.pids[axis as keyof typeof recommendations.pids];
                return (
                    <div key={axis} className="bg-black/30 p-4 rounded border border-gray-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-4xl uppercase select-none group-hover:opacity-20 transition-opacity">
                            {axis.substring(0,1)}
                        </div>
                        <h4 className="text-gray-400 uppercase font-mono mb-4 text-sm tracking-widest">{axis} AXIS</h4>
                        
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[#00f3ff] font-bold">P</span>
                                <div className="flex-1 mx-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00f3ff]" style={{ width: `${Math.min(pid.p, 100)}%` }}></div>
                                </div>
                                <span className="font-mono text-white w-8 text-right">{pid.p}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#00f3ff] font-bold">I</span>
                                <div className="flex-1 mx-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00f3ff]" style={{ width: `${Math.min(pid.i, 100)}%` }}></div>
                                </div>
                                <span className="font-mono text-white w-8 text-right">{pid.i}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#00f3ff] font-bold">D</span>
                                <div className="flex-1 mx-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#00f3ff]" style={{ width: `${Math.min(pid.d, 100)}%` }}></div>
                                </div>
                                <span className="font-mono text-white w-8 text-right">{pid.d}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
            </div>
        </div>
      ) : (
        <div className="relative">
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={handleCopy}
                    className="bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20 text-[#00f3ff] border border-[#00f3ff]/30 px-3 py-1.5 rounded text-xs font-mono flex items-center gap-2 transition-colors"
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIED' : 'COPY SNIPPET'}
                </button>
            </div>
            <pre className="bg-[#0a0a0f] p-4 rounded border border-gray-800 font-mono text-sm text-gray-300 overflow-x-auto custom-scrollbar shadow-inner h-[300px]">
                {generateCLI()}
            </pre>
        </div>
      )}

      {recommendations.filters.length > 0 && (
         <div className="mt-6 border-t border-gray-800 pt-6">
            <h4 className="text-gray-400 font-mono text-sm mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                SUGGESTED FILTERS (HIGH NOISE DETECTED)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.filters.map((f, i) => (
                    <div key={i} className="bg-yellow-900/10 border border-yellow-500/20 p-3 rounded flex justify-between items-center">
                        <span className="text-yellow-500 font-mono text-xs uppercase">{f.axis} NOTCH</span>
                        <span className="text-gray-300 font-mono text-sm">
                            Center: <span className="text-white">{f.center_hz}Hz</span> / Cutoff: <span className="text-white">{f.cutoff_hz}Hz</span>
                        </span>
                    </div>
                ))}
            </div>
         </div>
      )}
    </div>
  );
}
