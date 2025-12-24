const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "PIDTUNEAI",
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load the Next.js server URL
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Start the Next.js server in the background
function startNextServer() {
  nextProcess = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    shell: true
  });

  nextProcess.stdout.on('data', (data) => {
    console.log(`Next.js: ${data}`);
    // Wait for Next.js to be ready before opening the window
    if (data.toString().includes('Ready')) {
      createWindow();
    }
  });
}

app.on('ready', startNextServer);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  // Kill Next.js server when app closes
  if (nextProcess) nextProcess.kill();
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
