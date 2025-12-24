'use client';

import React, { useState } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { X, Activity, Waves, Shield, Zap, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface DetailedChartsProps {
    data: any;
    onClose: () => void;
}

export default function DetailedCharts({ data, onClose }: DetailedChartsProps) {
    const [activeTab, setActiveTab] = useState<'spectrum' | 'step' | 'trace' | 'safety'>('spectrum');

    // Prepare Spectrum Data
    const spectrumData = [];
    const rollSpec = data.spectrum?.roll;
    const pitchSpec = data.spectrum?.pitch;
    const yawSpec = data.spectrum?.yaw;

    if (rollSpec && rollSpec.freqs && rollSpec.amps) {
        for (let i = 0; i < rollSpec.freqs.length; i++) {
            spectrumData.push({
                freq: Math.round(rollSpec.freqs[i]),
                roll: rollSpec.amps[i],
                pitch: pitchSpec?.amps[i] || 0,
                yaw: yawSpec?.amps[i] || 0
            });
        }
    }

    // Prepare Step Response Data
    const stepData = [];
    const rollStep = data.step_response?.roll;
    const pitchStep = data.step_response?.pitch;
    const yawStep = data.step_response?.yaw;

    if (rollStep && rollStep.time) {
        for (let i = 0; i < rollStep.time.length; i++) {
            stepData.push({
                time: rollStep.time[i],
                roll: rollStep.response[i],
                pitch: pitchStep?.response[i] || 0,
                yaw: yawStep?.response[i] || 0
            });
        }
    }

    // Prepare Raw Trace Data
    const traceData = [];
    const trace = data.raw_snippet;
    if (trace && trace.time) {
        for (let i = 0; i < trace.time.length; i++) {
            traceData.push({
                time: Math.round(trace.time[i]),
                rollGyro: trace.roll_gyro[i],
                rollSetpoint: trace.roll_setpoint[i],
                pitchGyro: trace.pitch_gyro[i],
                pitchSetpoint: trace.pitch_setpoint[i],
            });
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0a0a0f] border border-[#00f3ff]/30 w-full max-w-5xl h-[80vh] rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.1)] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">System Identification</h2>
                        <p className="text-xs font-mono text-gray-400">LOG ANALYSIS & TELEMETRY</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 bg-black/40 overflow-x-auto">
                    {[
                        { id: 'spectrum', label: 'Noise Spectrum', icon: Waves },
                        { id: 'trace', label: 'Flight Trace', icon: Activity },
                        { id: 'step', label: 'Step Response', icon: Zap },
                        { id: 'safety', label: 'Safety & Latency', icon: Shield },
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "flex-1 min-w-[150px] py-4 text-[10px] font-mono flex items-center justify-center gap-2 transition-colors relative tracking-widest",
                                activeTab === tab.id ? "text-[#00f3ff] bg-[#00f3ff]/5" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <tab.icon className="w-3 h-3" /> {tab.label.toUpperCase()}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00f3ff] shadow-[0_0_10px_#00f3ff]"></div>}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-hidden flex flex-col relative bg-[#050508]">
                     <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>

                     {activeTab === 'spectrum' && (
                        <div className="flex-1 min-h-0 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                             <div className="flex-1 w-full min-h-0 rounded-xl border border-gray-800 bg-black/40 p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={spectrumData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                        <XAxis dataKey="freq" tick={{fill:'#444', fontSize:10}} label={{value:'Hz', position:'insideBottomRight', fill:'#444'}} />
                                        <YAxis tick={{fill:'#444', fontSize:10}} />
                                        <Tooltip contentStyle={{backgroundColor:'#0a0a0f', border:'1px solid #333'}} />
                                        <Legend verticalAlign="top" height={36}/>
                                        <Line type="monotone" dataKey="roll" stroke="#00f3ff" dot={false} strokeWidth={2} />
                                        <Line type="monotone" dataKey="pitch" stroke="#ff0099" dot={false} strokeWidth={2} />
                                        <Line type="monotone" dataKey="yaw" stroke="#00ff66" dot={false} strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                     )}

                     {activeTab === 'trace' && (
                        <div className="flex-1 min-h-0 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex-1 w-full min-h-0 rounded-xl border border-gray-800 bg-black/40 p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={traceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                        <XAxis dataKey="time" tick={{fill:'#444', fontSize:10}} label={{value:'ms', position:'insideBottomRight', fill:'#444'}} />
                                        <YAxis tick={{fill:'#444', fontSize:10}} />
                                        <Tooltip contentStyle={{backgroundColor:'#0a0a0f', border:'1px solid #333'}} />
                                        <Legend verticalAlign="top" height={36}/>
                                                                        <Line 
                                                                            type="monotone" 
                                                                            dataKey="rollSetpoint" 
                                                                            stroke="#ffaa00" 
                                                                            strokeWidth={3} 
                                                                            strokeDasharray="8 4" 
                                                                            dot={false} 
                                                                            name="Setpoint (Target)" 
                                                                        />
                                                                        <Line 
                                                                            type="monotone" 
                                                                            dataKey="rollGyro" 
                                                                            stroke="#00f3ff" 
                                                                            dot={false} 
                                                                            strokeWidth={2} 
                                                                            name="Actual Gyro (Reality)" 
                                                                        />
                                        
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="mt-4 text-center text-[10px] text-gray-600 font-mono uppercase tracking-widest">Raw Blackbox snippet: Gyro vs Stick Input tracking</p>
                        </div>
                     )}

                     {activeTab === 'step' && (
                        <div className="flex-1 min-h-0 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex-1 w-full min-h-0 rounded-xl border border-gray-800 bg-black/40 p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stepData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                        <XAxis dataKey="time" tick={{fill:'#444', fontSize:10}} />
                                        <YAxis tick={{fill:'#444', fontSize:10}} domain={[0, 1.4]} />
                                        <Tooltip contentStyle={{backgroundColor:'#0a0a0f', border:'1px solid #333'}} />
                                        <Legend verticalAlign="top" height={36}/>
                                        <ReferenceLine y={1} stroke="#444" strokeDasharray="3 3" />
                                        <Line type="monotone" dataKey="roll" stroke="#00f3ff" dot={false} strokeWidth={3} />
                                        <Line type="monotone" dataKey="pitch" stroke="#ff0099" dot={false} strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                     )}

                     {activeTab === 'safety' && (
                        <div className="flex-1 overflow-auto animate-in fade-in zoom-in-95 duration-300 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-black/60 border border-gray-800 p-6 rounded-2xl">
                                    <h3 className="text-[#00f3ff] font-mono text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
                                        <Activity className="w-4 h-4" /> Filter Latency
                                    </h3>
                                    <div className="flex items-end gap-4">
                                        <div className="text-5xl font-bold text-white font-mono">
                                            {data.safety_metrics?.roll?.latency_ms}
                                            <span className="text-lg text-gray-500 ml-2">ms</span>
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-green-500" 
                                                    style={{ width: `${Math.max(0, 100 - (data.safety_metrics?.roll?.latency_ms * 10))}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[10px] text-gray-500 font-mono leading-relaxed">
                                        Estimated phase delay from gyro filters. Values under 5ms are excellent for racing. Over 8ms may feel "mushy".
                                    </p>
                                </div>

                                <div className="bg-black/60 border border-gray-800 p-6 rounded-2xl">
                                    <h3 className="text-[#ff0099] font-mono text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
                                        <Shield className="w-4 h-4" /> Motor Heat Risk
                                    </h3>
                                    <div className="space-y-6">
                                        {['roll', 'pitch'].map(axis => (
                                            <div key={axis} className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-mono uppercase">
                                                    <span className="text-gray-400">{axis} AXIS</span>
                                                    <span className={data.safety_metrics?.[axis]?.heat_risk > 60 ? 'text-red-500' : 'text-green-500'}>
                                                        {data.safety_metrics?.[axis]?.heat_risk}% RISK
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className={clsx("h-full transition-all duration-1000", data.safety_metrics?.[axis]?.heat_risk > 60 ? 'bg-red-500' : 'bg-[#ff0099]')}
                                                        style={{ width: `${data.safety_metrics?.[axis]?.heat_risk}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-[10px] text-gray-500 font-mono leading-relaxed">
                                        Calculated based on D-term gain vs. high-frequency noise levels. High risk indicates potential for hot motors.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#00f3ff]/5 border border-[#00f3ff]/20 p-6 rounded-2xl flex items-start gap-4">
                                <Info className="w-5 h-5 text-[#00f3ff] mt-1 shrink-0" />
                                <div>
                                    <h4 className="text-[#00f3ff] font-mono text-xs uppercase tracking-widest mb-2">Tuning Advisory</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                        The oscillation risk on your build is currently <span className="text-white font-bold underline decoration-[#00f3ff]">{data.safety_metrics?.roll?.oscillation_risk}</span>. 
                                        {data.safety_metrics?.roll?.oscillation_risk === 'High' 
                                            ? ' We recommend increasing filtering or lowering D-gain before proceeding.' 
                                            : ' Your noise profile suggests you could safely reduce filtering for better latency.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}
