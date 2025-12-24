'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploaderProps {
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing: boolean;
  error?: string | null;
}

export default function FileUploader({ onAnalyze, isAnalyzing, error }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAnalyze(e.dataTransfer.files[0]);
    }
  }, [onAnalyze]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onAnalyze(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div
        className={clsx(
          "relative flex flex-col items-center justify-center w-full h-48 border border-dashed rounded-xl transition-all duration-300 backdrop-blur-sm",
          dragActive ? "border-[#00f3ff] bg-[#00f3ff]/10 scale-[1.02] shadow-[0_0_20px_rgba(0,243,255,0.2)]" : "border-gray-700 bg-black/40 hover:border-[#00f3ff]/50 hover:bg-black/60",
          isAnalyzing && "pointer-events-none opacity-50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#00f3ff] animate-spin" />
              <p className="text-xs text-[#00f3ff] font-mono tracking-[0.2em] animate-pulse">ANALYZING...</p>
            </div>
          ) : (
            <div className="group flex flex-col items-center gap-3 transition-transform duration-300">
              <div className="p-3 rounded-full bg-[#00f3ff]/5 border border-[#00f3ff]/20 group-hover:bg-[#00f3ff]/10 group-hover:border-[#00f3ff]/50 transition-colors">
                 <Upload className="w-6 h-6 text-[#00f3ff]" />
              </div>
              <p className="text-sm font-mono text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-widest">
                Drop Log File
              </p>
            </div>
          )}
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
          disabled={isAnalyzing}
        />
        <label 
          htmlFor="dropzone-file" 
          className="absolute inset-0 cursor-pointer"
        />
      </div>
      
      {error && (
        <div className="mt-4 p-4 border border-red-500/50 bg-red-900/20 rounded-lg flex items-center gap-3 text-red-400">
           <AlertCircle className="w-5 h-5" />
           <span className="text-sm font-mono">{error}</span>
        </div>
      )}
    </div>
  );
}
