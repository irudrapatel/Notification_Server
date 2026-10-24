# Camera Notification Server & Live Alarm Dashboard

A real-time Webhook receiver and Live Dashboard for IP camera alarm notifications (motion detection, AI human/vehicle detection, line crossing, tamper, and occlusion alarms).

## Features
- **HTTP Webhook Receiver:** Accepts POST requests at `/api/alarm`, `/api/event`, and `/api/notification`.
- **Live WebSocket Dashboard:** Instant real-time UI updates as soon as the camera detects an event (no page refresh required).
- **Event Visual Indicators:** Color-coded event tags (Human, Vehicle, Motion, Tamper).
- **REST API:** Query historical alarms via `GET /api/alarms`.
- **Test Mode:** Built-in "Send Test Alarm" button in the web UI.
- **PM2 Ready:** Background process management with auto-restart.

---

## Installation & Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/irudrapatel/Notification_Server.git
   cd Notification_Server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run directly:**
   ```bash
   node server.js
   ```

4. **Run with PM2:**
   ```bash
   pm2 start server.js --name notification-server
   pm2 save
   ```

5. **Open Dashboard:**
   Visit `http://<YOUR_SERVER_IP>:8080/` in your web browser.

---

## Camera Configuration (Novatek Web UI)

Open the camera web interface and navigate to **Event > Notification > Custom Alarm Server**:

| Field | Value |
| :--- | :--- |
| **Custom Server Enable** | `ON` |
| **Protocol** | `HTTP` |
| **Server Host** | Your Server IP (e.g. `192.168.7.158`) |
| **Port** | `8080` |

---

## Alarm Payload Format
When an event occurs, the camera posts JSON in this format:
```json
{
  "event": "human",
  "engine": "pvd",
  "state": "active",
  "device": "ArcisAI Camera",
  "device_id": "00:12:34:56:78:9A",
  "serial": "NOV2026102401",
  "mac": "00:12:34:56:78:9A",
  "ip": "192.168.7.117",
  "time": "2026-10-24T06:14:01.000Z",
  "timestamp": 1729750441,
  "time_str": "11:44:01",
  "snapshot": "/event_images/human_20261024_114401.jpg"
}
```

---

## License
MIT
