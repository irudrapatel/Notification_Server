const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const PORT = parseInt(process.env.NOTIFY_PORT || '8080', 10);
const HOST_IP = process.env.HOST_IP || '192.168.7.158';
const DB_FILE = path.join(__dirname, 'events_history.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(PUBLIC_DIR));

// Load existing events
let events = [];
if (fs.existsSync(DB_FILE)) {
  try {
    events = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    events = [];
  }
}

function saveEvents() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(events.slice(-200), null, 2));
  } catch (e) {
    console.error('[Notify] Save failed:', e.message);
  }
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Handler for all alarm / event posts from camera
const handleAlarmPost = (req, res) => {
  const remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const payload = req.body || {};
  const receivedAt = new Date().toISOString();

  const record = {
    id: Date.now() + '-' + Math.floor(Math.random() * 1000),
    received_at: receivedAt,
    client_ip: remoteIp,
    ...payload
  };

  events.unshift(record);
  if (events.length > 500) events.pop();
  saveEvents();

  console.log(`\n🔔 ================= [CAMERA ALARM RECEIVED] =================`);
  console.log(`Time:    ${receivedAt}`);
  console.log(`From IP: ${remoteIp}`);
  console.log(`Event:   ${record.event || payload.eventType || 'alarm'}`);
  console.log(`Engine:  ${record.engine || payload.engine || 'camera'}`);
  console.log(`Device:  ${record.device || record.device_id || 'ArcisAI'}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  console.log(`===============================================================\n`);

  // Broadcast to all connected web clients in real time
  broadcast({ type: 'NEW_ALARM', data: record });

  res.status(200).json({ rval: 0, msg: 'Alarm received successfully', id: record.id });
};

// Endpoints supported
app.post('/api/alarm', handleAlarmPost);
app.post('/api/event', handleAlarmPost);
app.post('/api/notification', handleAlarmPost);
app.post('/', (req, res) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return handleAlarmPost(req, res);
  }
  res.status(200).send('Notification Server is Running');
});

// GET recent alarms
app.get('/api/alarms', (req, res) => {
  res.json({ rval: 0, count: events.length, data: events });
});

// Clear alarms
app.post('/api/alarms/clear', (req, res) => {
  events = [];
  saveEvents();
  broadcast({ type: 'CLEAR_ALARMS' });
  res.json({ rval: 0, msg: 'Alarms cleared' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Notification Server running at http://${HOST_IP}:${PORT}`);
  console.log(`🌐 Alarm Webhook Endpoint: http://${HOST_IP}:${PORT}/api/alarm`);
  console.log(`💻 Web Dashboard:          http://${HOST_IP}:${PORT}/`);
  console.log(`====================================================`);
});

