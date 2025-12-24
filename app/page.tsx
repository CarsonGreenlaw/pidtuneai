'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import NoiseChart from '@/components/NoiseChart';
import TuningReport from '@/components/TuningReport';
import DetailedCharts from '@/components/DetailedCharts';
import { Activity, Zap, Cpu, BarChart2 } from 'lucide-react';

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [weight, setWeight] = useState<string>('250');
  const [size, setSize] = useState<string>('5"');
  const [style, setStyle] = useState<string>('freestyle');

  const sizes = [
    '65mm', '75mm', '85mm', '2"', '2.5"', '3"', '3.5"', '4"', '5"', '6"', '7"'
  ];

  const handleAnalyze = async (file: File) => {
    setAnalyzing(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('weight', weight);
    formData.append('size', size);
    formData.append('style', style);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to analyze file');
      }

      if (result.error) {
          throw new Error(result.error);
      }
      
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const loadSample = async () => {
      const dummyContent = "time (us),gyroADC[0],gyroADC[1],gyroADC[2],setpoint[0],setpoint[1],setpoint[2]\n" + 
                           Array.from({length: 1000}, (_, i) => 
                               `${i*1000},${Math.sin(i*0.1)*50 + Math.random()*10},${Math.cos(i*0.1)*50},${Math.sin(i*0.05)*30},0,0,0`
                           ).join('\n');
      
      const file = new File([dummyContent], "sample_log.csv", { type: "text/csv" });
      await handleAnalyze(file);
  };

  return (
    <main className="min-h-screen pb-20 cyber-grid relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-transparent to-[#0a0a0f] pointer-events-none"></div>
      
      {/* Header */}
      <header className="border-b border-[#00f3ff]/20 bg-[#0a0a0f]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <button 
                onClick={() => { setData(null); setShowDetails(false); }}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
                <div className="w-10 h-10 bg-[#00f3ff]/10 rounded flex items-center justify-center border border-[#00f3ff]/50 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                    <Activity className="w-6 h-6 text-[#00f3ff]" />
                </div>
                <div className="text-left">
                    <h1 className="text-2xl font-black tracking-tighter text-white uppercase">PIDTUNE<span className="text-[#00f3ff]">AI</span></h1>
                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Autonomous PID Optimization</p>
                </div>
            </button>
            <div className="flex gap-4">
                 <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-gray-900 border border-gray-800">
                    <Cpu className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-mono text-gray-400">ENGINE: <span className="text-green-500">READY</span></span>
                 </div>
            </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        
        {/* Hero / Upload Section */}
        {!data && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center mb-10 max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        Optimize Your Tune <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#00ff66]">In Seconds</span>
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Instant AI PID tuning & noise analysis from Blackbox logs.
                    </p>
                </div>

                {/* Drone Config */}
                <div className="flex flex-wrap items-end gap-6 mb-10 bg-[#0a0a0f]/80 p-8 rounded-2xl border border-[#00f3ff]/20 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="flex flex-col gap-3 min-w-[180px]">
                        <label className="text-xs font-mono text-[#00f3ff] uppercase tracking-[0.2em] pl-1">
                            Frame Size
                        </label>
                        <div className="relative group">
                            <select 
                                value={size} 
                                onChange={(e) => setSize(e.target.value)}
                                className="w-full bg-black/60 border-2 border-gray-800 text-white text-base font-medium rounded-xl px-4 py-3 outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all appearance-none cursor-pointer"
                            >
                                {sizes.map(s => <option key={s} value={s} className="bg-[#0a0a0f]">{s}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-[#00f3ff]">
                                ▾
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-mono text-[#00f3ff] uppercase tracking-[0.2em] pl-1">
                            Takeoff Weight (g)
                        </label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-36 bg-black/60 border-2 border-gray-800 text-white text-base font-medium rounded-xl px-4 py-3 outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[180px]">
                        <label className="text-xs font-mono text-[#00f3ff] uppercase tracking-[0.2em] pl-1">
                            Tuning Style
                        </label>
                        <div className="relative group">
                            <select 
                                value={style} 
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full bg-black/60 border-2 border-gray-800 text-white text-base font-medium rounded-xl px-4 py-3 outline-none focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all appearance-none cursor-pointer"
                            >
                                <option value="freestyle" className="bg-[#0a0a0f]">Freestyle (Balanced)</option>
                                <option value="cinematic" className="bg-[#0a0a0f]">Cinematic (Smooth)</option>
                                <option value="racing" className="bg-[#0a0a0f]">Racing (Crisp)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-focus-within:text-[#00f3ff]">
                                ▾
                            </div>
                        </div>
                    </div>
                </div>

                <FileUploader onAnalyze={handleAnalyze} isAnalyzing={analyzing} error={error} />
                
                <button 
                    onClick={loadSample}
                    disabled={analyzing}
                    className="mt-6 text-sm font-mono text-gray-500 hover:text-[#00f3ff] underline decoration-dashed underline-offset-4 transition-colors disabled:opacity-50"
                >
                    Or load a generated sample log
                </button>
            </div>
        )}

        {/* Dashboard Section */}
        {data && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#ff0099]" />
                        ANALYSIS COMPLETE
                    </h2>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowDetails(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm font-mono text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300"
                        >
                            <BarChart2 className="w-4 h-4" />
                            SEE MORE
                        </button>
                        <button 
                            onClick={() => { setData(null); setShowDetails(false); }}
                            className="group flex items-center gap-2 px-6 py-2.5 bg-[#00f3ff]/5 border border-[#00f3ff]/30 rounded-lg text-sm font-mono text-[#00f3ff] hover:bg-[#00f3ff]/20 hover:border-[#00f3ff] transition-all duration-300 shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                        >
                            <Activity className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                            UPLOAD NEW LOG
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Col: Visuals */}
                    <div className="space-y-8">
                        <NoiseChart data={data.noise_analysis} />
                        
                        <div className="hud-panel p-6 rounded-lg">
                            <h3 className="text-gray-400 font-mono text-sm mb-4">LOG METRICS</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/40 p-3 rounded border border-gray-800">
                                    <div className="text-xs text-gray-500 uppercase">Sampling Rate</div>
                                    <div className="text-xl font-mono text-white">{Math.round(data.sampling_rate)} Hz</div>
                                </div>
                                <div className="bg-black/40 p-3 rounded border border-gray-800">
                                    <div className="text-xs text-gray-500 uppercase">Duration</div>
                                    <div className="text-xl font-mono text-white">{data.log_duration_sec.toFixed(2)}s</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Tuning */}
                    <div>
                        <TuningReport recommendations={data.recommendations} />
                    </div>
                </div>

                {/* Detailed View Modal */}
                {showDetails && (
                    <DetailedCharts data={data} onClose={() => setShowDetails(false)} />
                )}
            </div>
        )}

      </div>

      {/* Footer Disclaimer */}
      <footer className="mt-20 border-t border-gray-900 bg-black/20 py-8 px-6 text-center relative z-10">
          <p className="max-w-2xl mx-auto text-[10px] font-mono text-gray-600 uppercase tracking-widest leading-loose">
              <span className="text-red-900 font-bold mr-2">DISCLAIMER:</span> 
              Use these recommendations at your own risk. The creator is not responsible for any damage to your hardware, electronics, or persons resulting from the use of this tool.
          </p>
      </footer>
    </main>
  );
}
