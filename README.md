# 🛸 PIDTUNEAI
### Autonomous Betaflight PID Tuning & Blackbox Analysis

PIDTUNEAI is a professional-grade web tool designed specifically for FPV drone pilots. It analyzes Betaflight Blackbox logs to generate optimized PID gains and filter settings tailored to your drone's physical specs.

---

## 🚀 How to Run (Local Setup)

To use this tool locally on your computer, follow these simple steps:

### 1. Prerequisites
Ensure you have the following installed:
*   **Node.js** (v18 or newer)
*   **Python 3.9+**

### 2. Installation
Clone this repository or download the ZIP, then open your terminal in the folder and run:

```bash
# Install frontend dependencies
npm install

# Install python analysis engine dependencies
pip install -r requirements.txt
```

### 3. Start the App
Run the following command to launch the interface:

```bash
npm run dev
```

Once started, open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠 Optimal Blackbox Settings
For the best results, set your drone to the following in the Betaflight Blackbox tab:
*   **Logging Rate:** 2.0kHz
*   **Debug Mode:** `GYRO_SCALED`
*   **Logging Mode:** `NORMAL`

---

## 📋 Features
*   **AI Tuning:** Intelligent PID scaling based on frame size and weight.
*   **Flight Trace:** View your Actual Gyro vs. Stick Setpoint in high fidelity.
*   **Noise Spectrum:** Interactive FFT graphs to identify frame resonance.
*   **Safety Metrics:** Estimated filter latency and motor heat risk analysis.
*   **CLI Export:** One-click copy for Betaflight 4.5+ commands.

---

## ⚠️ Disclaimer
Use these recommendations at your own risk. The creator is not responsible for any damage to your hardware, electronics, or persons resulting from the use of this tool.