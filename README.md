# JalRakshak.AI — IoT Water Quality Monitor

> **Microsoft AI Unlock Hackathon · AI for India Track**  
> Built by **DualCode Team** — Raj Rabidas & Mansi Rajput, IIT Roorkee

**🌐 Live Dashboard →** [jalrakshak-ai-dualcore.vercel.app](https://jalrakshak-ai-dualcore.vercel.app/)  
**📖 Docs / Circuit Diagram / Code Generator →** [jalrakshak-ai-dualcore.vercel.app/docs](https://jalrakshak-ai-dualcore.vercel.app/docs)

---

## Quick Start — Flash Your ESP32 Node

> **Template sketch:** [`JalRakshak_Node_Template.ino`](./JalRakshak_Node_Template.ino)  
> Full interactive code generator (paste your keys, download the sketch): [/docs](https://jalrakshak-ai-dualcore.vercel.app/docs#arduino-code)

### What you need from the TTN Console

| Credential | Format | Where to find it |
|---|---|---|
| **DevEUI** | 8 bytes, **LSB** (use the ↕ toggle) | TTN Console → End Device → Overview |
| **AppKey** | 16 bytes, **MSB** | TTN Console → End Device → Overview |
| **AppEUI** | 8 bytes, all zeros | Leave as-is (default) |

### Open `JalRakshak_Node_Template.ino` and replace these lines

```cpp
// DevEUI — 8 bytes LSB
static const u1_t PROGMEM DEVEUI[8] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00   // <-- YOUR DEVEUI
};

// AppKey — 16 bytes MSB
static const u1_t PROGMEM APPKEY[16] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,   // <-- YOUR APPKEY
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00    // <-- (cont.)
};
```

### Required Arduino libraries

```
MCCI LoRaWAN LMIC  ·  OneWire  ·  DallasTemperature
Adafruit SSD1306   ·  Adafruit GFX  ·  ESP32 board package
```

### Circuit connections (at a glance)

| Sensor / Module | ESP32 GPIO |
|---|---|
| LoRa SX1276 NSS | GPIO 5 |
| LoRa SX1276 RST | GPIO 26 |
| LoRa DIO0 / DIO1 / DIO2 | GPIO 25 / 33 / 32 |
| LoRa MOSI / MISO / SCK | GPIO 23 / 19 / 18 |
| TDS sensor (analog) | GPIO 2 |
| pH sensor (analog) | GPIO 34 |
| DS18B20 temperature (1-Wire) | GPIO 14 |
| OLED SDA / SCL | GPIO 21 / 22 |

> Full wiring diagram with component photos: [jalrakshak-ai-dualcore.vercel.app/docs#hardware](https://jalrakshak-ai-dualcore.vercel.app/docs#hardware)

---

Real-time water quality monitoring powered by LoRaWAN IoT sensor nodes and an AI prediction engine. Physical sensors (ESP32 + LoRa SX1276) transmit pH, TDS, and temperature over The Things Network (TTN). A Next.js dashboard receives data via TTN webhook, persists it in MongoDB, and runs AI-based water safety predictions.

---

## What It Does

| Capability | Details |
|---|---|
| **Live sensor ingestion** | Receives TTN uplink webhooks from LoRaWAN nodes; decodes both TTN-decoded payloads and raw Base64 bytes |
| **Water quality prediction** | Classifies water as **Safe / Unsafe** with a safety score (0–100), risk level, possible causes, recommended actions, and a trend-based future risk |
| **Multi-device dashboard** | Shows a card per IoT device with latest readings, AI prediction badge, signal strength (RSSI/SNR), and a 50-point history chart |
| **Model simulator** | Interactive sliders (pH, TDS, turbidity, conductivity, temperature) to test the AI engine without hardware |
| **Offline resilience** | Falls back from MongoDB → SmartPark relay → cached localStorage data so the UI never goes blank |
| **30-day data retention** | MongoDB TTL index auto-purges readings older than 30 days |

### Sensor Parameters Tracked

| Parameter | Safe Range | Source |
|---|---|---|
| pH | 6.5 – 8.5 | Hardware sensor |
| TDS (Total Dissolved Solids) | < 500 ppm | Hardware sensor |
| Temperature | — | Hardware sensor |
| Turbidity | < 5 NTU | Server-generated (random 1–10 NTU until hardware wired) |
| Conductivity | < 600 μS/cm | Derived: `TDS × 2` |
| RSSI / SNR / Spreading Factor | — | LoRa RF metadata from TTN |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Charts | Recharts |
| Icons | Lucide React |
| Theming | next-themes (dark / light) |
| Database | MongoDB (Atlas) via **Prisma ORM v6** |
| Admin UI | shadcn/ui (Radix primitives, sidebar, cards, accordion) |
| IoT Network | The Things Network (TTN) — LoRaWAN |
| Hardware | ESP32 + LoRa SX1276 |
| AI Engine (primary) | Python FastAPI + Random Forest (scikit-learn, 3,276 samples) — [GitHub: Jalrakshak-ai-model](https://github.com/RAJ-IITROORKEE/Jalrakshak-ai-model) |
| AI Engine (fallback) | TypeScript threshold-based engine (built-in) |
| Deployment | Vercel (frontend), Railway (Python model server) |

---

## Project Structure

```
hydro-monitor-app/
├── app/
│   ├── (main)/               # Public route group — wraps pages with Navbar + Footer
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Live dashboard — device cards, stats, model simulator
│   │   ├── about/page.tsx        # Project info, features, team
│   │   ├── contact/page.tsx      # Contact page
│   │   └── docs/page.tsx         # Developer docs (TTN decoder, webhook, API, hardware)
│   ├── admin/                # ⚙️ Admin panel — no Navbar/Footer, sidebar layout
│   │   ├── layout.tsx            # SidebarProvider + AppSidebar + SiteHeader
│   │   ├── dashboard/page.tsx    # Device CRUD — add/edit/delete IoT devices
│   │   └── live-data/page.tsx    # Live webhook log — accordion raw JSON, auto-refresh
│   ├── layout.tsx            # Root layout — ThemeProvider only
│   └── api/
│       ├── webhook/route.ts          # POST — receives TTN uplink, saves to MongoDB
│       ├── sensor-data/route.ts      # GET  — readings (MongoDB → relay sync → empty)
│       ├── predict/route.ts          # POST — AI water quality prediction
│       ├── db-test/route.ts          # GET  — MongoDB health check
│       ├── seed-device/route.ts      # POST — seeds a demo device into DB
│       └── admin/
│           ├── devices/route.ts      # GET/POST — list + create devices
│           ├── devices/[id]/route.ts # GET/PUT/DELETE — single device CRUD
│           └── live-data/route.ts    # GET — last 100 readings for log viewer
├── components/
│   ├── admin/
│   │   ├── app-sidebar.tsx       # Sidebar nav (Dashboard, Devices, Live Data)
│   │   └── site-header.tsx       # Admin topbar
│   ├── device-card.tsx           # Per-device card (readings + prediction + chart)
│   ├── hero-section.tsx          # Dashboard hero banner
│   ├── model-simulator.tsx       # Interactive AI model tester with sliders
│   ├── sensor-history-chart.tsx  # Recharts line chart for reading history
│   ├── stats-bar.tsx             # Summary stats (total/safe/alert/readings)
│   ├── navbar.tsx / footer.tsx
│   └── ui/                       # Radix-based shadcn components
├── lib/
│   ├── prisma.ts             # PrismaClient singleton (globalThis cache)
│   ├── predict.ts            # TypeScript AI fallback engine
│   ├── store.ts              # In-memory reading store (dev/legacy)
│   ├── local-history.ts      # localStorage history (up to 500 readings)
│   └── utils.ts              # cn() Tailwind class helper
├── prisma/
│   └── schema.prisma         # Device + Reading models (MongoDB via Prisma)
└── types/index.ts            # SensorReading, WaterPrediction, DeviceReading interfaces
```

---

## Backend Architecture

### Data Flow

```
IoT Node (ESP32 + LoRa)
    │  LoRa radio packet (pH + TDS + temperature in 6 bytes)
    ▼
The Things Network (TTN)
    │  TTN uplink decoder (JavaScript payload formatter)
    │  → decoded_payload: { temperature, tds, ph }
    ▼
POST /api/webhook  (Next.js API route)
    ├── Parses decoded payload OR decodes raw Base64 bytes as fallback
    ├── Computes turbidity (random 1–10 NTU) and conductivity (TDS × 2)
    ├── Upserts Reading document in MongoDB (idempotent on readingId UUID)
    └── Upserts Device document (updates last-seen, latest values, increments totalReadings)
    
Frontend (browser, polling every 30 s)
    │
    ├── GET /api/sensor-data
    │       ├── 1st: MongoDB → returns up to 500 readings (newest first)
    │       ├── 2nd: SmartPark relay (RELAY_URL) if MongoDB is empty
    │       └── 3rd: empty response
    │
    ├── POST /api/predict  (per device, using latest reading)
    │       ├── 1st: Python FastAPI at FASTAPI_URL (8-second timeout)
    │       └── 2nd: TypeScript engine (threshold-based, always available)
    │
    └── localStorage (jalrakshak_history) — caches up to 500 readings for history charts
```

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/webhook` | TTN uplink receiver. Optionally validated via `X-TTN-Secret` header. Parses decoded payload or raw Base64 bytes. Writes to MongoDB via Prisma. |
| `GET` | `/api/sensor-data` | Returns devices + per-device history. Syncs up to 20 latest relay entries before responding. |
| `POST` | `/api/predict` | Accepts `{ ph, tds, conductivity, turbidity }`. Returns `WaterPrediction` with `engine: "railway"` or `"typescript"`. |
| `GET` | `/api/db-test` | Returns `{ db, devices, readings }` — quick connectivity check. |
| `GET` | `/api/admin/devices` | List all devices. |
| `POST` | `/api/admin/devices` | Create a new device entry. |
| `PUT` | `/api/admin/devices/[id]` | Update a device (name, location, etc.). |
| `DELETE` | `/api/admin/devices/[id]` | Remove a device and all its readings. |
| `GET` | `/api/admin/live-data?limit=N` | Last N readings (max 200) across all devices, newest first. |

All `/api/*` routes expose CORS headers (`Access-Control-Allow-Origin: *`) to support the TTN webhook and the SmartPark relay.

### MongoDB Models

Managed via **Prisma ORM** (`prisma/schema.prisma`). Run `npx prisma db push` after cloning to sync the schema.

**`readings` collection** — one document per TTN uplink  
Fields: `readingId` (UUID, unique), `deviceId`, `deviceName`, `timestamp`, `receivedAt`, `temperature`, `ph`, `tds`, `turbidity`, `conductivity`, `rssi`, `snr`, `spreadingFactor`, prediction fields (`predictionStatus`, `predictionScore`, `predictionRiskLevel`, `predictionConfidence`, `predictionCauses[]`, `predictionActions[]`, `predictionFutureRisk`).

**`devices` collection** — one document per IoT device  
Fields: `deviceId` (unique), `deviceName`, `location`, `description`, `isActive`, `lastSeen`, `lastPh/Tds/Temperature/Turbidity/Conductivity`, `rssi`, `snr`, `spreadingFactor`, `totalReadings` (counter), `createdAt`, `updatedAt`  
Upserted (not inserted) on every incoming webhook — also manageable via the Admin Panel.

### AI Prediction Engine

The TypeScript fallback engine (`lib/predict.ts`) mirrors the Python Random Forest logic:

- **Safety score** (0–100): starts at 100, deducts points for out-of-range parameters
- **Risk level**: Low (≥80), Moderate (≥50), High (<50)
- **Possible causes**: contextual strings for each violated threshold
- **Recommended actions**: remediation advice per threshold violation
- **Future risk**: ring buffer of last 5 readings detects rising turbidity or TDS trends

The primary engine is a **Random Forest classifier** (scikit-learn) trained on `water_potability.csv` (3,276 samples), served via FastAPI.  
**Model server source code →** [github.com/RAJ-IITROORKEE/Jalrakshak-ai-model](https://github.com/RAJ-IITROORKEE/Jalrakshak-ai-model)  
Deploy it to Railway, copy the public URL, and set `FASTAPI_URL` in your `.env.local`.

---

## Environment Variables

Create a `.env.local` file in the `hydro-monitor-app/` directory:

```env
# ── Required ──────────────────────────────────────────────────────────────
# MongoDB connection URI (MongoDB Atlas or self-hosted)
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# ── Optional ──────────────────────────────────────────────────────────────
# Shared secret validated against the X-TTN-Secret header on /api/webhook
# Leave unset to accept all incoming webhooks (use only during development)
TTN_WEBHOOK_SECRET=your_secret_here

# URL of the Python FastAPI prediction server (Railway / Azure / local)
# If unset, the TypeScript fallback engine is used automatically
FASTAPI_URL=https://your-model-server.railway.app

# TTN relay URL for seeding the dashboard when MongoDB is empty
# Default: https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
RELAY_URL=https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
```

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | MongoDB connection string; app throws on startup if missing |
| `TTN_WEBHOOK_SECRET` | No | `null` (no auth) | Validates `X-TTN-Secret` header on webhook route |
| `FASTAPI_URL` | No | `null` | Python model server; falls back to TypeScript engine if absent or unreachable |
| `RELAY_URL` | No | SmartPark relay URL | Relay used to seed readings when MongoDB is empty |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (or local MongoDB instance)
- (Optional) Python FastAPI model server — [github.com/RAJ-IITROORKEE/Jalrakshak-ai-model](https://github.com/RAJ-IITROORKEE/Jalrakshak-ai-model)  
  Deploy to Railway and set `FASTAPI_URL` in `.env.local` (see Environment Variables)

### Installation

```bash
cd hydro-monitor-app
npm install
```

### Development

```bash
# Create .env.local and fill in DATABASE_URL (see above)
cp .env.local.example .env.local   # or create manually

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Start (Production)

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## TTN Webhook Setup

1. In your TTN application, go to **Integrations → Webhooks → Add webhook**.
2. Set the **Base URL** to `https://<your-domain>/api/webhook`.
3. Enable **Uplink message** events.
4. (Optional) Add a header `X-TTN-Secret: <value>` and set `TTN_WEBHOOK_SECRET` to the same value.

**TTN Payload Formatter** — add this under *Payload Formatters → Uplink → Custom JavaScript*:

```js
function decodeUplink(input) {
  var temp = (input.bytes[0] << 8 | input.bytes[1]) / 10;  // °C
  var tds  = (input.bytes[2] << 8 | input.bytes[3]);        // ppm
  var ph   = (input.bytes[4] << 8 | input.bytes[5]) / 100; // 0–14
  return { data: { temperature: temp, tds: tds, ph: ph } };
}
```

For local development without a live TTN device, the dashboard seeds from the SmartPark relay automatically.

---

## Pages

### Public

| Route | Description |
|---|---|
| `/` | Live dashboard — device cards, stats bar, auto-refresh, model simulator |
| `/about` | Project overview, feature list, hardware details, team info |
| `/docs` | Developer documentation — TTN decoder, webhook setup, API reference, hardware wiring |
| `/contact` | Contact information |

### Admin Panel

> **No authentication is implemented yet.** The `/admin/*` routes are currently open. Add an auth layer (e.g. NextAuth.js or Clerk) before deploying to production.

Navigate to **`/admin/dashboard`** in the browser to open the admin panel.

| Route | Description |
|---|---|
| `/admin/dashboard` | **Device Manager** — view all registered IoT devices, add new devices (ID, name, location, description), edit or delete existing ones. Each device card shows the last-seen timestamp, cumulative reading count, and latest sensor values. |
| `/admin/live-data` | **Live Webhook Log** — real-time stream of the last 100 incoming readings from all devices. Each row shows device ID (colour-coded), sensor pills (pH / TDS / temp / turbidity), AI prediction badge, and timestamp. Click any row to expand the full raw JSON. Auto-refreshes every 15 s with an on/off toggle. |

#### Adding a New Device

1. Go to `/admin/dashboard`.
2. Click **Add Device** (top-right).
3. Fill in **Device ID** (must match the `device_id` TTN sends — e.g. `hydro-monitor-01`), display name, optional location and description.
4. Click **Save**. The device will appear in the dashboard and start receiving readings as soon as TTN sends an uplink.

#### Monitoring Live Data

1. Go to `/admin/live-data`.
2. Readings arrive automatically every time TTN posts an uplink to `/api/webhook` (or when `/api/sensor-data` syncs from the relay).
3. Use **Auto (15s)** to keep the log refreshing automatically, or click **Refresh** for an immediate pull.
4. Expand any row to inspect the full stored reading object including AI prediction fields.

---

## Hardware

- **Microcontroller**: ESP32
- **Radio**: LoRa SX1276 (LoRaWAN, long-range low-power)
- **Sensors**: pH probe, TDS probe, temperature sensor
- **Power**: Battery-operated; transmits once per minute
- **Coverage**: Works in areas without cellular connectivity (rural / agricultural)
