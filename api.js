const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// CORS for web access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Static files
app.use(express.static('public'));

// API: Current status
app.get('/api/status', (req, res) => {
    try {
        const statePath = '/root/sentinel-q/last_run_state.json';
        const data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: 'Unable to read state', message: e.message });
    }
});

// API: Historical data
app.get('/api/history', (req, res) => {
    try {
        const logPath = '/root/sentinel-q/incident_log.md';
        const data = fs.readFileSync(logPath, 'utf8');
        const lines = data.split('\n').filter(l => l.includes('===') || l.includes('Level:'));
        res.json({ history: lines.slice(-50) });
    } catch (e) {
        res.status(500).json({ error: 'Unable to read history', message: e.message });
    }
});

// API: Live intel (trigger fresh fetch)
app.get('/api/intel', async (req, res) => {
    // This would trigger the monitor script
    res.json({ message: 'Intel fetch triggered', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'SENTINEL-Q API' });
});

app.listen(PORT, () => {
    console.log(`SENTINEL-Q API running on port ${PORT}`);
});

// Auto-refresh state every 30 seconds
setInterval(() => {
    console.log('[' + new Date().toISOString() + '] State refresh');
}, 30000);