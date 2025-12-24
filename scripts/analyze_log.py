import sys
import pandas as pd
import numpy as np
import json
from scipy.fft import fft, fftfreq

def analyze_log(file_path, weight=None, size=None, tuning_style="freestyle"):
    try:
        # Find the header row (skip metadata)
        skip_rows = 0
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f):
                # Betaflight headers have many columns, metadata usually has 1 or 2
                if 'time' in line.lower() and line.count(',') > 10:
                    skip_rows = i
                    break
        
        # Load CSV data
        # sep=None with engine='python' allows auto-detection of the separator
        df = pd.read_csv(file_path, skiprows=skip_rows, sep=None, engine='python', on_bad_lines='skip')
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        gyro_cols = [c for c in df.columns if 'gyroADC' in c]
        setpoint_cols = [c for c in df.columns if 'setpoint' in c]
        
        if not gyro_cols or not setpoint_cols:
            return {"error": "Could not identify Gyro or Setpoint columns."}

        # Basic Noise Analysis (FFT)
        noise_profile = {}
        spectrum = {}
        sampling_rate = 1000 
        total_noise_energy = 0
        
        time_col = next((c for c in df.columns if 'time' in c.lower()), None)
        if time_col:
            try:
                df[time_col] = pd.to_numeric(df[time_col], errors='coerce')
                dt = df[time_col].diff().mean() / 1e6
                if dt > 0:
                    sampling_rate = 1.0 / dt
            except:
                pass

        for axis, col in zip(['roll', 'pitch', 'yaw'], gyro_cols):
            data = df[col].dropna().values
            n = len(data)
            if n > 100:
                yf = fft(data)
                xf = fftfreq(n, 1 / sampling_rate)[:n//2]
                amplitudes = 2.0/n * np.abs(yf[0:n//2])
                
                mask = (xf > 20) & (xf < 600)
                freqs_filtered = xf[mask]
                amps_filtered = amplitudes[mask]
                
                step = max(1, len(freqs_filtered) // 200) 
                
                spectrum[axis] = {
                    "freqs": freqs_filtered[::step].tolist(),
                    "amps": amps_filtered[::step].tolist()
                }

                if np.any(mask):
                    peak_idx = np.argmax(amps_filtered)
                    peak_freq = freqs_filtered[peak_idx]
                    peak_amp = amps_filtered[peak_idx]
                    total_noise_energy += np.sum(amps_filtered)

                    noise_profile[axis] = {
                        "peak_freq_hz": float(peak_freq),
                        "peak_amplitude": float(peak_amp)
                    }

        # Base PIDs
        base_pids = {
            "roll": {"p": 45, "i": 85, "d": 30},
            "pitch": {"p": 48, "i": 90, "d": 32},
            "yaw": {"p": 45, "i": 90, "d": 0},
        }

        # Size/Weight Scaling
        pid_multiplier = 1.0
        if size:
            if "mm" in size:
                val = float(size.replace("mm", ""))
                if val <= 75: pid_multiplier = 1.8 
            elif "\"" in size:
                val = float(size.replace("\"", ""))
                if val <= 2.5: pid_multiplier = 1.5
                elif val <= 3.5: pid_multiplier = 1.2
                elif val >= 6: pid_multiplier = 0.8 

        # Filter Slider Heuristic
        filter_slider = 1.0
        style_mod = 0.0
        if tuning_style == "cinematic": style_mod = -0.3
        elif tuning_style == "racing": style_mod = 0.3
        
        noise_mod = 0.0
        if total_noise_energy > 500: noise_mod = -0.4
        elif total_noise_energy < 150: noise_mod = 0.2
        
        filter_slider = max(0.5, min(2.0, filter_slider + style_mod + noise_mod))

        for axis in base_pids:
            base_pids[axis]["p"] = int(base_pids[axis]["p"] * pid_multiplier)
            base_pids[axis]["d"] = int(base_pids[axis]["d"] * pid_multiplier)

        recommendations = {
            "filters": [],
            "filter_slider": round(filter_slider, 2),
            "pids": base_pids
        }
        
        for axis, noise in noise_profile.items():
            if noise['peak_amplitude'] > 15:
                freq = int(noise['peak_freq_hz'])
                recommendations['filters'].append({
                    "type": "gyro_notch",
                    "axis": axis,
                    "center_hz": freq,
                    "cutoff_hz": max(0, freq - 20)
                })

        # Step Response Simulation (Heuristic)
        step_response = {}
        t_step = np.linspace(0, 0.1, 50) 
        for axis in ['roll', 'pitch', 'yaw']:
            p = recommendations['pids'][axis]['p']
            d = recommendations['pids'][axis]['d']
            damping = (d / 2.0) / np.sqrt(p) if p > 0 else 0.5
            omega = np.sqrt(p) * 2.0
            if damping < 1.0:
                 wd = omega * np.sqrt(1 - damping**2)
                 y = 1 - np.exp(-damping * omega * t_step) * (np.cos(wd * t_step) + (damping/np.sqrt(1-damping**2)) * np.sin(wd * t_step))
            else:
                 y = 1 - np.exp(-damping * omega * t_step) * (1 + omega * t_step)
            step_response[axis] = {
                "time": (t_step * 1000).tolist(),
                "response": y.tolist()
            }

        # Raw Data Snippet
        mid = len(df) // 2
        snippet_len = min(500, len(df))
        start = max(0, mid - snippet_len // 2)
        end = start + snippet_len
        df_snippet = df.iloc[start:end]
        
        raw_snippet = {
            "time": ((df_snippet[time_col] - df_snippet[time_col].iloc[0]) / 1000).tolist() if time_col else list(range(snippet_len)),
            "roll_gyro": df_snippet[gyro_cols[0]].tolist() if len(gyro_cols) > 0 else [],
            "roll_setpoint": df_snippet[setpoint_cols[0]].tolist() if len(setpoint_cols) > 0 else [],
            "pitch_gyro": df_snippet[gyro_cols[1]].tolist() if len(gyro_cols) > 1 else [],
            "pitch_setpoint": df_snippet[setpoint_cols[1]].tolist() if len(setpoint_cols) > 1 else [],
        }

        # Safety & Latency Metrics (Practical)
        safety_metrics = {}
        for axis in ['roll', 'pitch', 'yaw']:
            latency = (1.0 / filter_slider) * 4.0 
            noise_amp = noise_profile.get(axis, {}).get('peak_amplitude', 0)
            d_gain = recommendations['pids'][axis]['d']
            heat_score = (d_gain * noise_amp) / 10.0
            safety_metrics[axis] = {
                "latency_ms": round(latency, 1),
                "heat_risk": min(100, round(heat_score, 1)),
                "oscillation_risk": "Low" if noise_amp < 20 else "Moderate" if noise_amp < 50 else "High"
            }

        return {
            "status": "success",
            "noise_analysis": noise_profile,
            "spectrum": spectrum,
            "step_response": step_response,
            "raw_snippet": raw_snippet,
            "safety_metrics": safety_metrics,
            "recommendations": recommendations,
            "sampling_rate": sampling_rate,
            "log_duration_sec": len(df) / sampling_rate,
            "drone_config": {"size": size, "weight": weight, "style": tuning_style}
        }

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    weight = sys.argv[2] if len(sys.argv) > 2 else None
    size = sys.argv[3] if len(sys.argv) > 3 else None
    style = sys.argv[4] if len(sys.argv) > 4 else "freestyle"
    
    result = analyze_log(file_path, weight, size, style)
    print(json.dumps(result))