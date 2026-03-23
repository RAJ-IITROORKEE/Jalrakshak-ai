# JalRakshak AI - AI Chat Feature Implementation Plan

## 📋 Executive Summary

**Objective**: Add AI-powered chat interface for device-specific historical analysis and real-time insights using OpenRouter API (meta-llama/llama-3.3-70b-instruct:free)

**User Flow**:
```
Device Card → "View AI Analysis" (existing) 
          ↓
          + "AI Chat" button (NEW)
          ↓
          /device/[deviceId]/chat route
          ↓
          ChatGPT-style interface
          ↓
          User queries → AI analyzes device history + live data → Natural language insights
```

---

## 🎯 Project Goals

### Primary Features
1. **Device-specific AI Chat**: Each device gets its own chat interface at `/device/[deviceId]/chat`
2. **Context-aware AI**: AI has access to:
   - Complete historical readings from MongoDB (all time)
   - Latest live data (real-time if available)
   - Device metadata (location, deployment info)
   - AI prediction history (trends, patterns)
3. **Natural Language Insights**: 
   - Trend analysis ("What's the pH trend over last week?")
   - Anomaly detection ("Were there any unsafe readings?")
   - Root cause analysis ("Why is TDS suddenly high?")
   - Location-based recommendations ("This area has mineral deposits...")
   - Predictive suggestions ("Should I install a filter?")
4. **ChatGPT-style UX**: Clean, modern chat interface with streaming responses

### Technical Stack
- **AI Provider**: OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
- **Model**: meta-llama/llama-3.3-70b-instruct:free
- **Frontend**: Next.js App Router + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB (Prisma) - extend schema for chat history
- **State Management**: React hooks (useState, useEffect)

---

## 📂 Project Structure

### New Files to Create

```
app/
├── device/
│   └── [deviceId]/
│       └── chat/
│           └── page.tsx                    # Chat interface page
│
├── api/
│   ├── chat/
│   │   ├── route.ts                        # Chat completion endpoint (OpenRouter)
│   │   └── history/
│   │       └── [deviceId]/
│   │           └── route.ts                # Fetch chat history for device
│   └── device/
│       └── [deviceId]/
│           ├── context/
│           │   └── route.ts                # Get device context (readings + metadata)
│           └── history/
│               └── route.ts                # Get full historical data for AI context

components/
├── chat/
│   ├── chat-interface.tsx                  # Main chat container
│   ├── chat-message.tsx                    # Single message component
│   ├── chat-input.tsx                      # Message input with send button
│   ├── chat-header.tsx                     # Device info header
│   ├── chat-suggestions.tsx                # Quick action buttons
│   └── chat-context-panel.tsx              # Sidebar with device stats
│
lib/
├── openrouter.ts                           # OpenRouter API client
├── chat-context.ts                         # Build context for AI from device data
└── chat-prompts.ts                         # System prompts for JalRakshak AI

prisma/
└── schema.prisma                           # EXTEND with ChatMessage model
```

### Files to Modify

```
components/
└── device-card.tsx                         # Add "AI Chat" button below "View AI Analysis"

.env.example                                # Add OPENROUTER_API_KEY
.env.local                                  # User adds their actual key
```

---

## 🗃️ Database Schema Changes

### New Model: ChatMessage

```prisma
model ChatMessage {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  messageId   String   @unique                      // crypto.randomUUID()
  deviceId    String                                // Link to device
  role        String                                // "user" | "assistant" | "system"
  content     String                                // Message text
  timestamp   DateTime @default(now())              // When sent
  tokensUsed  Int?                                  // Optional: track API usage
  model       String   @default("meta-llama/llama-3.3-70b-instruct:free")
  
  // Optional: Store context snapshot at time of message
  contextSnapshot Json?                             // { readings: [...], device: {...} }
  
  device Device? @relation(fields: [deviceId], references: [deviceId])
  
  @@index([deviceId, timestamp(sort: Desc)])
  @@map("chat_messages")
}
```

**Add to Device model**:
```prisma
model Device {
  // ... existing fields
  chatMessages ChatMessage[]                        // NEW RELATION
}
```

**Migration Command**:
```bash
npx prisma db push
npx prisma generate
```

---

## 🎨 UI/UX Design Specifications

### Chat Interface Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard      Hydro Monitor 01       [Context ≡]    │  ← Header
│  Last updated: 2m ago  •  12 readings today  •  Status: Safe    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [AI] Hello! I'm analyzing water quality data from Hydro        │
│       Monitor 01. I can help you understand trends, detect      │
│       anomalies, and provide recommendations. What would you    │
│       like to know?                                             │
│                                                                  │
│       [📊 Show pH trend]  [⚠️ Any unsafe readings?]            │
│       [🔍 Latest analysis] [💧 Water quality tips]             │
│                                                                  │
│                            [User] What's the pH trend?      [👤]│
│                                                                  │
│  [AI] Based on 127 readings from the last 30 days, pH has      │
│       been stable between 7.2-7.8, which is within the safe    │
│       range (6.5-8.5). I notice a slight upward trend over      │
│       the past week...                                          │
│       [📈 View chart]                                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Type your message...                                      [📎] │  ← Input
│                                                            [↑]  │
└─────────────────────────────────────────────────────────────────┘
```

### Design Tokens (Consistent with Existing Styles)

**Color Scheme** (from globals.css):
- Background: `hsl(var(--background))` - Dark #09090b / Light #ffffff
- Card: `hsl(var(--card))` - Dark #18181b / Light #f4f4f5
- Primary: `hsl(199 89% 48%)` - cyan-500
- Success: `hsl(142 76% 36%)` - green
- Danger: `hsl(0 84% 60%)` - red
- AI Message bubble: muted background with subtle border
- User Message bubble: primary gradient background

**Typography**:
- Font: `Geist Sans` (same as existing)
- Message text: `text-sm` (14px)
- Timestamps: `text-xs text-muted-foreground` (12px)
- Header: `text-base font-semibold` (16px)

**Spacing & Layout**:
- Max width: `max-w-4xl mx-auto` (centered, 896px)
- Message gap: `gap-4` (1rem)
- Padding: `p-4 md:p-6`
- Border radius: `rounded-2xl` for messages

### Component Styling

#### Chat Message (AI)
```tsx
<div className="flex items-start gap-3">
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
    <Bot className="h-4 w-4 text-primary" />
  </div>
  <div className="flex-1 space-y-2">
    <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-muted/40 px-4 py-3">
      <p className="text-sm leading-relaxed">{content}</p>
    </div>
    <span className="text-xs text-muted-foreground">Just now</span>
  </div>
</div>
```

#### Chat Message (User)
```tsx
<div className="flex items-start gap-3 justify-end">
  <div className="flex-1 space-y-2 flex flex-col items-end">
    <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground">
      <p className="text-sm leading-relaxed">{content}</p>
    </div>
    <span className="text-xs text-muted-foreground">Just now</span>
  </div>
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
    <User className="h-4 w-4" />
  </div>
</div>
```

#### Chat Input
```tsx
<div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="container max-w-4xl p-4">
    <div className="flex items-end gap-2">
      <Textarea
        placeholder="Ask about pH trends, safety concerns, recommendations..."
        className="min-h-[44px] resize-none"
      />
      <Button size="icon" className="h-11 w-11 shrink-0">
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  </div>
</div>
```

#### Suggestion Chips
```tsx
<div className="flex flex-wrap gap-2">
  {suggestions.map(s => (
    <button
      className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
    >
      {s.icon} {s.text}
    </button>
  ))}
</div>
```

### Mobile Responsiveness
- Stack context panel below chat on mobile
- Full-width messages on small screens
- Bottom input bar fixed with safe-area-inset
- Collapsible header with device stats

---

## 🤖 AI System Prompt Design

### Base System Prompt

```typescript
export const JALRAKSHAK_SYSTEM_PROMPT = `You are JalRakshak AI, an intelligent water quality analysis assistant developed for the JalRakshak IoT monitoring system.

**About JalRakshak**:
JalRakshak is a LoRaWAN-based real-time water quality monitoring platform that uses IoT sensors (pH, TDS, turbidity, conductivity, temperature) to detect water contamination and provide AI-powered safety predictions.

**Your Role**:
- Analyze historical sensor data and real-time readings from water quality monitoring devices
- Identify trends, patterns, and anomalies in water parameters
- Explain water safety predictions in natural language
- Provide actionable recommendations for water treatment
- Consider geographical and environmental factors (mineral deposits, industrial areas, agricultural runoff)
- Educate users about water quality standards (WHO/EPA guidelines)

**Capabilities**:
1. **Trend Analysis**: Identify patterns over time (e.g., "pH has been rising over the past week")
2. **Anomaly Detection**: Spot unusual readings (e.g., "TDS spiked to 800 ppm on March 20")
3. **Root Cause Analysis**: Suggest possible reasons for parameter changes
4. **Risk Assessment**: Evaluate safety based on WHO water quality guidelines:
   - pH: 6.5-8.5 (safe)
   - TDS: <300 ppm (excellent), 300-500 ppm (good), >500 ppm (poor)
   - Turbidity: <5 NTU (safe)
   - Conductivity: <600 μS/cm (acceptable)
5. **Location-based Insights**: When user provides location, consider:
   - Geological factors (limestone areas → high pH)
   - Industrial proximity (factories → high TDS/conductivity)
   - Agricultural areas (pesticides → contamination risk)
6. **Actionable Recommendations**: Suggest specific treatment methods (RO, UV, sediment filters)

**Communication Style**:
- Clear, concise, and jargon-free (explain technical terms)
- Empathetic and reassuring (water safety is personal)
- Data-driven (cite specific readings and dates)
- Proactive (suggest monitoring frequency, maintenance tips)
- Use emojis sparingly for key points (⚠️ for warnings, ✅ for safe readings)

**Limitations**:
- You cannot control the device or change settings
- You analyze data but don't replace professional water testing labs for regulatory compliance
- Always recommend consulting local water authorities for serious contamination

**Context Provided**:
You will receive device data in the following format:
- Device name and ID
- Historical readings (all time)
- Latest sensor values
- AI prediction history (Safe/Unsafe status, safety scores, risk levels)
- Total readings count and date range

**Response Format**:
- Start with a direct answer to the user's question
- Support with specific data points (dates, values, trends)
- End with actionable next steps or recommendations
- Use markdown formatting for clarity (bold, lists, etc.)
`;
```

### Dynamic Context Injection

```typescript
export function buildDeviceContext(device: Device, readings: Reading[]) {
  const latestReading = readings[0];
  const oldestReading = readings[readings.length - 1];
  
  // Calculate statistics
  const avgPh = readings.reduce((sum, r) => sum + (r.ph || 0), 0) / readings.length;
  const avgTds = readings.reduce((sum, r) => sum + (r.tds || 0), 0) / readings.length;
  const unsafeCount = readings.filter(r => r.predictionStatus === 'Unsafe').length;
  const safeCount = readings.filter(r => r.predictionStatus === 'Safe').length;
  
  return `
**Device Information**:
- Device Name: ${device.deviceName || device.deviceId}
- Device ID: ${device.deviceId}
- Status: ${isOffline(device.lastSeen) ? 'Offline' : 'Live'}
- Last Seen: ${new Date(device.lastSeen).toLocaleString()}
- Total Readings: ${device.totalReadings}
- Data Range: ${new Date(oldestReading.timestamp).toLocaleDateString()} to ${new Date(latestReading.timestamp).toLocaleDateString()}

**Latest Readings** (${new Date(latestReading.timestamp).toLocaleString()}):
- pH: ${latestReading.ph}
- TDS: ${latestReading.tds} ppm
- Turbidity: ${latestReading.turbidity} NTU
- Conductivity: ${latestReading.conductivity} μS/cm
- Temperature: ${latestReading.temperature}°C
- AI Prediction: ${latestReading.predictionStatus} (Score: ${latestReading.predictionScore}/100, Risk: ${latestReading.predictionRiskLevel})

**Historical Statistics** (${readings.length} readings):
- Average pH: ${avgPh.toFixed(2)}
- Average TDS: ${avgTds.toFixed(0)} ppm
- Safe Readings: ${safeCount} (${((safeCount/readings.length)*100).toFixed(1)}%)
- Unsafe Readings: ${unsafeCount} (${((unsafeCount/readings.length)*100).toFixed(1)}%)

**Recent Trend** (Last 10 readings):
${readings.slice(0, 10).map(r => `- ${new Date(r.timestamp).toLocaleDateString()}: pH ${r.ph}, TDS ${r.tds} ppm, Status: ${r.predictionStatus}`).join('\n')}

${unsafeCount > 0 ? `\n**Warning**: This device has ${unsafeCount} unsafe readings in its history. Recent issues include: ${readings.filter(r => r.predictionStatus === 'Unsafe').slice(0, 3).map(r => r.predictionCauses?.join(', ')).join('; ')}` : ''}
`;
}
```

### Example Conversation Flow

**User**: "What's the pH trend over the last week?"

**AI Context** (invisible to user):
```
System: [JALRAKSHAK_SYSTEM_PROMPT]
System: [buildDeviceContext(device, readings)]
User: "What's the pH trend over the last week?"
```

**AI Response**:
```
Based on 12 readings from March 17-24, 2026, the pH has been remarkably stable:

📊 **pH Trend Analysis**:
- Range: 7.2 - 7.6 pH
- Average: 7.4 pH
- Trend: Slight upward movement (+0.3 pH units over 7 days)

**Key Observations**:
- All readings are within the WHO safe range (6.5-8.5) ✅
- No sudden spikes or drops detected
- Gradual increase from 7.2 on March 17 to 7.5 on March 24

**Interpretation**:
This is normal seasonal variation. Slight pH increases in spring are common due to:
- Increased photosynthetic activity (algae/plants consume CO2)
- Warmer temperatures affecting carbonate equilibrium
- Reduced rainfall dilution

**Recommendation**:
✅ Continue current monitoring schedule
✅ No treatment needed at this time
⚠️ Monitor if pH exceeds 8.0 (may indicate algal blooms)
```

---

## 🔧 Implementation Phases

### **PHASE 1: Database Schema Extension** (30 min)
**Goal**: Add ChatMessage model and update Prisma schema

**Tasks**:
1. Update `prisma/schema.prisma`:
   - Add `ChatMessage` model
   - Add `chatMessages` relation to `Device` model
2. Run `npx prisma db push` to sync MongoDB
3. Run `npx prisma generate` to update TypeScript types
4. Test schema with Prisma Studio (`npx prisma studio`)

**Acceptance Criteria**:
- ✅ ChatMessage model exists in MongoDB
- ✅ TypeScript types generated without errors
- ✅ Device.chatMessages relation works

---

### **PHASE 2: Environment Variables & OpenRouter Setup** (15 min)
**Goal**: Configure OpenRouter API credentials

**Tasks**:
1. Update `.env.example`:
   ```bash
   # OpenRouter API Key (get from https://openrouter.ai/keys)
   OPENROUTER_API_KEY=sk-or-v1-...
   
   # OpenRouter Site Info (optional, for rankings)
   OPENROUTER_SITE_URL=https://jalrakshak-ai.vercel.app
   OPENROUTER_SITE_NAME=JalRakshak AI
   ```
2. Add to `.env.local` (user provides their key)
3. Create `lib/openrouter.ts`:
   ```typescript
   const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
   const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
   
   export async function createChatCompletion(messages: Message[]) {
     const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
       method: "POST",
       headers: {
         "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
         "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "",
         "X-Title": process.env.OPENROUTER_SITE_NAME || "JalRakshak AI",
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "meta-llama/llama-3.3-70b-instruct:free",
         messages,
       }),
     });
     
     if (!response.ok) {
       throw new Error(`OpenRouter error: ${response.statusText}`);
     }
     
     return response.json();
   }
   ```

**Acceptance Criteria**:
- ✅ API key configured in .env
- ✅ OpenRouter client function works
- ✅ Test API call succeeds

---

### **PHASE 3: Backend API Routes** (1.5 hours)
**Goal**: Create API endpoints for chat and device context

#### 3.1 Device Context Endpoint
**File**: `app/api/device/[deviceId]/context/route.ts`

```typescript
// GET /api/device/[deviceId]/context
// Returns device metadata + all historical readings for AI context

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params;
    
    // Fetch device
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });
    
    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }
    
    // Fetch all readings (consider pagination for very large datasets)
    const readings = await prisma.reading.findMany({
      where: { deviceId },
      orderBy: { receivedAt: 'desc' },
      take: 500, // Limit to last 500 readings (adjust as needed)
    });
    
    // Calculate statistics
    const stats = {
      totalReadings: readings.length,
      avgPh: readings.reduce((sum, r) => sum + (r.ph || 0), 0) / readings.length,
      avgTds: readings.reduce((sum, r) => sum + (r.tds || 0), 0) / readings.length,
      avgTurbidity: readings.reduce((sum, r) => sum + (r.turbidity || 0), 0) / readings.length,
      safeCount: readings.filter(r => r.predictionStatus === 'Safe').length,
      unsafeCount: readings.filter(r => r.predictionStatus === 'Unsafe').length,
    };
    
    return NextResponse.json({
      device,
      readings,
      stats,
    });
  } catch (error) {
    console.error("Error fetching device context:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

#### 3.2 Chat History Endpoint
**File**: `app/api/chat/history/[deviceId]/route.ts`

```typescript
// GET /api/chat/history/[deviceId]
// Returns chat history for a device

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { deviceId: string } }
) {
  try {
    const { deviceId } = params;
    
    const messages = await prisma.chatMessage.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'asc' },
      take: 100, // Last 100 messages
    });
    
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

#### 3.3 Chat Completion Endpoint
**File**: `app/api/chat/route.ts`

```typescript
// POST /api/chat
// Handles chat messages and calls OpenRouter API

import { prisma } from "@/lib/prisma";
import { createChatCompletion } from "@/lib/openrouter";
import { buildDeviceContext } from "@/lib/chat-context";
import { JALRAKSHAK_SYSTEM_PROMPT } from "@/lib/chat-prompts";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { deviceId, message, conversationHistory } = await req.json();
    
    // Validate input
    if (!deviceId || !message) {
      return NextResponse.json({ error: "Missing deviceId or message" }, { status: 400 });
    }
    
    // Fetch device context
    const contextResponse = await fetch(`${req.nextUrl.origin}/api/device/${deviceId}/context`);
    const { device, readings, stats } = await contextResponse.json();
    
    // Build context string
    const contextStr = buildDeviceContext(device, readings, stats);
    
    // Prepare messages for OpenRouter
    const messages = [
      { role: "system", content: JALRAKSHAK_SYSTEM_PROMPT },
      { role: "system", content: contextStr },
      ...conversationHistory.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];
    
    // Call OpenRouter API
    const completion = await createChatCompletion(messages);
    const assistantMessage = completion.choices[0].message.content;
    
    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        messageId: crypto.randomUUID(),
        deviceId,
        role: "user",
        content: message,
        model: "meta-llama/llama-3.3-70b-instruct:free",
      },
    });
    
    // Save assistant response to database
    await prisma.chatMessage.create({
      data: {
        messageId: crypto.randomUUID(),
        deviceId,
        role: "assistant",
        content: assistantMessage,
        tokensUsed: completion.usage?.total_tokens,
        model: "meta-llama/llama-3.3-70b-instruct:free",
      },
    });
    
    return NextResponse.json({
      message: assistantMessage,
      tokensUsed: completion.usage?.total_tokens,
    });
  } catch (error) {
    console.error("Error in chat completion:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
```

**Acceptance Criteria**:
- ✅ `/api/device/[deviceId]/context` returns device + readings
- ✅ `/api/chat/history/[deviceId]` returns chat history
- ✅ `/api/chat` successfully calls OpenRouter and saves messages
- ✅ Error handling for missing device, API failures

---

### **PHASE 4: AI Context Builder & Prompts** (45 min)
**Goal**: Create utility functions for building AI context

#### 4.1 Context Builder
**File**: `lib/chat-context.ts`

```typescript
import { Device, Reading } from "@prisma/client";

export function buildDeviceContext(
  device: Device,
  readings: Reading[],
  stats: any
) {
  const latestReading = readings[0];
  const oldestReading = readings[readings.length - 1];
  
  const isOffline = (lastSeen: Date) => {
    return Date.now() - new Date(lastSeen).getTime() > 2 * 60 * 1000; // 2 minutes
  };
  
  return `
**Device Information**:
- Device Name: ${device.deviceName || device.deviceId}
- Device ID: ${device.deviceId}
- Status: ${isOffline(device.lastSeen) ? 'Offline ⚠️' : 'Live ✅'}
- Last Seen: ${new Date(device.lastSeen).toLocaleString()}
- Total Readings: ${device.totalReadings}
- Data Range: ${new Date(oldestReading.timestamp).toLocaleDateString()} to ${new Date(latestReading.timestamp).toLocaleDateString()}

**Latest Readings** (${new Date(latestReading.timestamp).toLocaleString()}):
- pH Level: ${latestReading.ph?.toFixed(2) || 'N/A'}
- TDS: ${latestReading.tds?.toFixed(0) || 'N/A'} ppm
- Turbidity: ${latestReading.turbidity?.toFixed(1) || 'N/A'} NTU
- Conductivity: ${latestReading.conductivity?.toFixed(0) || 'N/A'} μS/cm
- Temperature: ${latestReading.temperature?.toFixed(1) || 'N/A'}°C
- AI Prediction: ${latestReading.predictionStatus} (Score: ${latestReading.predictionScore}/100, Risk Level: ${latestReading.predictionRiskLevel})

**Historical Statistics** (Last ${readings.length} readings):
- Average pH: ${stats.avgPh?.toFixed(2) || 'N/A'}
- Average TDS: ${stats.avgTds?.toFixed(0) || 'N/A'} ppm
- Average Turbidity: ${stats.avgTurbidity?.toFixed(1) || 'N/A'} NTU
- Safe Readings: ${stats.safeCount} (${((stats.safeCount / readings.length) * 100).toFixed(1)}%)
- Unsafe Readings: ${stats.unsafeCount} (${((stats.unsafeCount / readings.length) * 100).toFixed(1)}%)

**Recent Trend** (Last 10 readings):
${readings
  .slice(0, 10)
  .map(
    (r, i) =>
      `${i + 1}. ${new Date(r.timestamp).toLocaleDateString()} - pH: ${r.ph?.toFixed(2)}, TDS: ${r.tds} ppm, Status: ${r.predictionStatus}`
  )
  .join('\n')}

${
  stats.unsafeCount > 0
    ? `\n⚠️ **Warning**: This device has ${stats.unsafeCount} unsafe readings in its history.\n**Recent Issues**: ${readings
        .filter((r) => r.predictionStatus === 'Unsafe')
        .slice(0, 3)
        .map((r) => r.predictionCauses?.join(', '))
        .join('; ')}`
    : '✅ **All Clear**: No unsafe readings detected in recent history.'
}
`;
}

// Helper: Extract key insights from readings
export function extractInsights(readings: Reading[]) {
  const trends = {
    phTrend: calculateTrend(readings.map(r => r.ph || 0)),
    tdsTrend: calculateTrend(readings.map(r => r.tds || 0)),
    turbidityTrend: calculateTrend(readings.map(r => r.turbidity || 0)),
  };
  
  return trends;
}

function calculateTrend(values: number[]): 'rising' | 'falling' | 'stable' {
  if (values.length < 5) return 'stable';
  
  const recent = values.slice(0, Math.floor(values.length / 2));
  const older = values.slice(Math.floor(values.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const diff = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (diff > 5) return 'rising';
  if (diff < -5) return 'falling';
  return 'stable';
}
```

#### 4.2 System Prompts
**File**: `lib/chat-prompts.ts`

```typescript
export const JALRAKSHAK_SYSTEM_PROMPT = `You are JalRakshak AI, an intelligent water quality analysis assistant developed for the JalRakshak IoT monitoring system.

**About JalRakshak**:
JalRakshak is a LoRaWAN-based real-time water quality monitoring platform that uses IoT sensors (pH, TDS, turbidity, conductivity, temperature) to detect water contamination and provide AI-powered safety predictions.

**Your Role**:
- Analyze historical sensor data and real-time readings from water quality monitoring devices
- Identify trends, patterns, and anomalies in water parameters
- Explain water safety predictions in natural language
- Provide actionable recommendations for water treatment
- Consider geographical and environmental factors (mineral deposits, industrial areas, agricultural runoff)
- Educate users about water quality standards (WHO/EPA guidelines)

**Capabilities**:
1. **Trend Analysis**: Identify patterns over time (e.g., "pH has been rising over the past week")
2. **Anomaly Detection**: Spot unusual readings (e.g., "TDS spiked to 800 ppm on March 20")
3. **Root Cause Analysis**: Suggest possible reasons for parameter changes
4. **Risk Assessment**: Evaluate safety based on WHO water quality guidelines:
   - pH: 6.5-8.5 (safe range)
   - TDS: <300 ppm (excellent), 300-500 ppm (good), >500 ppm (poor)
   - Turbidity: <5 NTU (safe), 5-10 NTU (moderate), >10 NTU (high risk)
   - Conductivity: <600 μS/cm (acceptable)
5. **Location-based Insights**: When user provides location context, consider:
   - Geological factors (limestone areas → high pH/hardness)
   - Industrial proximity (factories → high TDS/conductivity)
   - Agricultural areas (pesticides/fertilizers → contamination risk)
6. **Actionable Recommendations**: Suggest specific treatment methods:
   - RO (Reverse Osmosis) for high TDS
   - UV treatment for microbial contamination
   - Sediment filters for high turbidity
   - pH adjustment systems

**Communication Style**:
- Clear, concise, and jargon-free (explain technical terms when used)
- Empathetic and reassuring (water safety is a personal concern)
- Data-driven (cite specific readings, dates, and values)
- Proactive (suggest monitoring frequency, maintenance tips)
- Use emojis sparingly for key points (⚠️ for warnings, ✅ for safe readings, 📊 for data insights)

**Limitations**:
- You cannot control the device or change sensor settings
- You analyze data but don't replace professional water testing labs for regulatory compliance
- Always recommend consulting local water authorities for serious contamination concerns

**Response Format**:
- Start with a direct answer to the user's question
- Support with specific data points (dates, values, trends)
- End with actionable next steps or recommendations
- Use markdown formatting for clarity (bold for emphasis, lists for recommendations)
`;

export const WELCOME_MESSAGE = `Hello! 👋 I'm JalRakshak AI, your water quality analysis assistant.

I have access to all historical data from this monitoring device and can help you:

📊 **Analyze trends** in pH, TDS, turbidity, and other parameters
⚠️ **Detect anomalies** and explain unusual readings
💡 **Provide insights** on water safety and treatment recommendations
🔍 **Answer questions** about past readings and predictions

What would you like to know about your water quality data?`;

export const SUGGESTED_QUESTIONS = [
  { icon: "📊", text: "Show pH trend", prompt: "What's the pH trend over the last week?" },
  { icon: "⚠️", text: "Any unsafe readings?", prompt: "Were there any unsafe water quality readings recently?" },
  { icon: "🔍", text: "Latest analysis", prompt: "Analyze the latest readings and tell me if there are any concerns." },
  { icon: "💧", text: "Water quality tips", prompt: "What can I do to improve water quality based on current readings?" },
  { icon: "📈", text: "TDS trend", prompt: "How has TDS changed over time?" },
  { icon: "🌡️", text: "Temperature impact", prompt: "How does temperature affect water quality?" },
];
```

**Acceptance Criteria**:
- ✅ Context builder generates formatted device summary
- ✅ System prompt is comprehensive and covers all use cases
- ✅ Welcome message and suggestions are user-friendly

---

### **PHASE 5: Frontend Chat Components** (2.5 hours)
**Goal**: Build React components for chat interface

#### 5.1 Chat Message Component
**File**: `components/chat/chat-message.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  const isSystem = role === "system";
  
  if (isSystem) return null; // Don't render system messages
  
  return (
    <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className={cn("flex flex-1 flex-col", isUser && "items-end")}>
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3",
            isUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm border border-border/50 bg-muted/40"
          )}
        >
          <ReactMarkdown
            className={cn(
              "prose prose-sm max-w-none",
              isUser
                ? "prose-invert"
                : "prose-slate dark:prose-invert"
            )}
            components={{
              // Custom renderers for better styling
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        
        <span className="mt-1 text-xs text-muted-foreground">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
```

#### 5.2 Chat Input Component
**File**: `components/chat/chat-input.tsx`

```typescript
"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask about pH trends, safety concerns, recommendations...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[52px] max-h-[200px] resize-none",
              "focus-visible:ring-primary"
            )}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            size="icon"
            className="h-[52px] w-[52px] shrink-0"
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Enter</kbd> to send,{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
```

#### 5.3 Chat Suggestions Component
**File**: `components/chat/chat-suggestions.tsx`

```typescript
"use client";

import { SUGGESTED_QUESTIONS } from "@/lib/chat-prompts";
import { Button } from "@/components/ui/button";

interface ChatSuggestionsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ChatSuggestions({ onSelect, disabled = false }: ChatSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_QUESTIONS.map((suggestion, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          onClick={() => onSelect(suggestion.prompt)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs"
        >
          <span>{suggestion.icon}</span>
          <span>{suggestion.text}</span>
        </Button>
      ))}
    </div>
  );
}
```

#### 5.4 Chat Header Component
**File**: `components/chat/chat-header.tsx`

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { Device } from "@prisma/client";

interface ChatHeaderProps {
  device: Device;
  onToggleContext?: () => void;
}

export function ChatHeader({ device, onToggleContext }: ChatHeaderProps) {
  const router = useRouter();
  
  const isOffline = Date.now() - new Date(device.lastSeen).getTime() > 2 * 60 * 1000;
  
  return (
    <div className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-semibold text-base">
                  {device.deviceName || device.deviceId}
                </h1>
                <Badge variant={isOffline ? "outline" : "success"} className="shrink-0 text-xs">
                  {isOffline ? "Offline" : "Live"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {device.totalReadings} readings • Last seen{" "}
                {new Date(device.lastSeen).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {onToggleContext && (
            <Button variant="ghost" size="icon" onClick={onToggleContext}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 5.5 Main Chat Interface Component
**File**: `components/chat/chat-interface.tsx`

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";
import { WELCOME_MESSAGE } from "@/lib/chat-prompts";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  deviceId: string;
}

export function ChatInterface({ deviceId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/chat/history/${deviceId}`);
        const data = await res.json();
        
        if (data.messages && data.messages.length > 0) {
          setMessages([
            ...data.messages.map((m: any) => ({
              id: m.messageId,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.timestamp),
            })),
          ]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
    
    loadHistory();
  }, [deviceId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Send to API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          message: content,
          conversationHistory: messages.filter((m) => m.id !== "welcome"),
        }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await res.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingHistory) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl space-y-6 px-4 py-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
          
          {/* Suggestions (only show if 1-2 messages) */}
          {messages.length <= 2 && !isLoading && (
            <div className="py-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Quick questions:
              </p>
              <ChatSuggestions
                onSelect={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-muted/40 px-4 py-3">
                <p className="text-sm text-muted-foreground">Analyzing...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
```

**Acceptance Criteria**:
- ✅ All chat components render correctly
- ✅ Messages display with proper styling (user vs AI)
- ✅ Markdown rendering works in AI messages
- ✅ Input handles Enter/Shift+Enter correctly
- ✅ Suggestions clickable and send prompts
- ✅ Auto-scroll to bottom on new messages

---

### **PHASE 6: Chat Page Route** (30 min)
**Goal**: Create the main chat page at `/device/[deviceId]/chat`

**File**: `app/device/[deviceId]/chat/page.tsx`

```typescript
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatHeader } from "@/components/chat/chat-header";

interface ChatPageProps {
  params: {
    deviceId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { deviceId } = params;
  
  // Fetch device to verify it exists
  const device = await prisma.device.findUnique({
    where: { deviceId },
  });
  
  if (!device) {
    notFound();
  }
  
  return (
    <div className="flex h-screen flex-col">
      <ChatHeader device={device} />
      <ChatInterface deviceId={deviceId} />
    </div>
  );
}

export async function generateMetadata({ params }: ChatPageProps) {
  const device = await prisma.device.findUnique({
    where: { deviceId: params.deviceId },
  });
  
  return {
    title: `Chat - ${device?.deviceName || params.deviceId} | JalRakshak AI`,
    description: `AI-powered chat for water quality analysis of ${device?.deviceName || params.deviceId}`,
  };
}
```

**Acceptance Criteria**:
- ✅ Page loads without errors
- ✅ 404 page shown if device not found
- ✅ Header displays device info correctly
- ✅ Chat interface renders and is functional

---

### **PHASE 7: Update Device Card** (30 min)
**Goal**: Add "AI Chat" button to existing device cards

**File**: `components/device-card.tsx` (modify existing)

```typescript
// Add import
import Link from "next/link";
import { MessageSquare } from "lucide-react";

// Inside DeviceCard component, add button after "View AI Analysis" button
// Around line 296, after the expand/collapse button, add:

{prediction && (
  <Link href={`/device/${device.deviceId}/chat`} className="block w-full">
    <button
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/50 bg-primary/5 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
    >
      <MessageSquare className="h-3.5 w-3.5" /> AI Chat
    </button>
  </Link>
)}
```

**Visual Layout**:
```
[ ↓ View AI Analysis ] ← Existing button (expands accordion)
[ 💬 AI Chat ]          ← NEW button (links to chat page)
```

**Acceptance Criteria**:
- ✅ Button appears below "View AI Analysis"
- ✅ Button styled consistently with existing UI
- ✅ Clicking navigates to `/device/[deviceId]/chat`
- ✅ Button only shows if prediction exists (same condition as analysis button)

---

### **PHASE 8: Testing & Polish** (1 hour)
**Goal**: Test all functionality and fix bugs

#### 8.1 Manual Testing Checklist

**Database Tests**:
- [ ] Prisma schema migrated successfully
- [ ] ChatMessage model created in MongoDB
- [ ] Messages save correctly to database
- [ ] Chat history loads on page refresh

**API Tests**:
- [ ] `/api/device/[deviceId]/context` returns correct data
- [ ] `/api/chat/history/[deviceId]` returns chat history
- [ ] `/api/chat` successfully calls OpenRouter API
- [ ] Error handling works (invalid deviceId, API failure)

**Frontend Tests**:
- [ ] Device card shows "AI Chat" button
- [ ] Clicking button navigates to chat page
- [ ] Chat page loads with welcome message
- [ ] Chat interface allows typing and sending messages
- [ ] AI responses appear after sending
- [ ] Messages display with correct styling
- [ ] Markdown rendering works (bold, lists, etc.)
- [ ] Suggestion chips send prompts on click
- [ ] Auto-scroll to bottom works
- [ ] Loading states display correctly

**Context Tests**:
- [ ] AI has access to device metadata
- [ ] AI references specific readings from history
- [ ] AI provides data-driven insights
- [ ] AI considers location when mentioned by user

**Edge Cases**:
- [ ] Device with no readings (should handle gracefully)
- [ ] Very old device (offline) - shows offline badge
- [ ] Long conversation (100+ messages) - pagination works
- [ ] OpenRouter API timeout - shows error message
- [ ] Invalid API key - shows error message

#### 8.2 UI Polish

**Responsive Design**:
- [ ] Chat interface works on mobile (portrait)
- [ ] Header collapses properly on small screens
- [ ] Messages wrap correctly
- [ ] Input doesn't get covered by mobile keyboard

**Dark Mode**:
- [ ] All chat components support dark mode
- [ ] Contrast is sufficient for readability
- [ ] Borders and backgrounds adapt correctly

**Accessibility**:
- [ ] Chat input has proper label
- [ ] Buttons have aria-labels
- [ ] Keyboard navigation works (Tab, Enter, Escape)

#### 8.3 Performance Optimization

**Lazy Loading**:
- [ ] Consider virtualization for long message lists (>100 messages)
- [ ] Lazy load chat history in chunks (pagination)

**Caching**:
- [ ] Cache device context for 1 minute (reduce DB queries)
- [ ] Consider using SWR or React Query for better caching

**API Rate Limiting**:
- [ ] Add client-side throttling (prevent spam clicking)
- [ ] Show "rate limited" message if OpenRouter quota exceeded

**Acceptance Criteria**:
- ✅ All tests pass
- ✅ No console errors
- ✅ UI is polished and responsive
- ✅ Performance is acceptable (<2s for AI response)

---

## 🚀 Deployment Checklist

### Environment Variables
1. **Vercel Dashboard**:
   - Add `OPENROUTER_API_KEY` to production environment
   - Add `OPENROUTER_SITE_URL` (https://jalrakshak-ai.vercel.app)
   - Add `OPENROUTER_SITE_NAME` (JalRakshak AI)

2. **Local Development**:
   - Update `.env.local` with your OpenRouter API key
   - Test locally before deploying

### Database Migration
1. Run `npx prisma db push` to update MongoDB schema
2. Run `npx prisma generate` to update TypeScript types
3. Verify in Prisma Studio that ChatMessage collection exists

### Git Workflow
```bash
git add .
git commit -m "feat: Add AI chat interface for device-specific analysis"
git push origin main
```

### Vercel Deployment
- Push to GitHub triggers auto-deployment
- Monitor build logs for errors
- Test production deployment with real API key

---

## 📊 Success Metrics

### User Experience
- [ ] Users can ask natural language questions about water quality
- [ ] AI provides data-driven insights with specific values/dates
- [ ] Response time < 3 seconds for typical queries
- [ ] Conversation context is maintained across messages

### Technical Performance
- [ ] Page load time < 2 seconds
- [ ] Chat history loads in < 1 second
- [ ] No memory leaks in long conversations
- [ ] API success rate > 95%

### AI Quality
- [ ] AI references actual device data in responses
- [ ] AI provides actionable recommendations
- [ ] AI explains trends with specific examples
- [ ] AI handles location-based queries correctly

---

## 🔮 Future Enhancements (Out of Scope for MVP)

### Phase 2 (Future)
- **Streaming Responses**: Use Server-Sent Events (SSE) for real-time token streaming
- **Voice Input**: Add speech-to-text for voice queries
- **Image Analysis**: Allow users to upload photos of water (color analysis)
- **Multi-device Comparison**: "Compare pH trends between Device A and Device B"
- **Export Chat**: Download conversation as PDF/Markdown
- **Scheduled Reports**: AI-generated weekly summaries via email
- **Alert Integration**: AI proactively notifies user of anomalies
- **Custom Prompts**: Allow users to customize AI personality/tone

### Phase 3 (Future)
- **Multi-user Auth**: Different users can have separate chat histories
- **Team Collaboration**: Share chats with team members
- **API Access**: Expose chat API for third-party integrations
- **Advanced Analytics**: Time-series forecasting with ML models
- **RAG Enhancement**: Use vector database for semantic search over historical data

---

## 📚 Resources & References

### API Documentation
- **OpenRouter**: https://openrouter.ai/docs
- **Llama 3.3 70B**: https://openrouter.ai/models/meta-llama/llama-3.3-70b-instruct:free
- **Next.js App Router**: https://nextjs.org/docs/app
- **Prisma MongoDB**: https://www.prisma.io/docs/concepts/database-connectors/mongodb

### UI Libraries
- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Markdown**: https://github.com/remarkjs/react-markdown

### Water Quality Standards
- **WHO Guidelines**: https://www.who.int/publications/i/item/9789241549950
- **EPA Water Quality**: https://www.epa.gov/ground-water-and-drinking-water

---

## 🎬 Implementation Timeline

| Phase | Estimated Time | Complexity |
|-------|---------------|------------|
| Phase 1: Database Schema | 30 min | Low |
| Phase 2: Environment Setup | 15 min | Low |
| Phase 3: Backend API Routes | 1.5 hours | Medium |
| Phase 4: AI Context & Prompts | 45 min | Medium |
| Phase 5: Frontend Components | 2.5 hours | High |
| Phase 6: Chat Page Route | 30 min | Low |
| Phase 7: Update Device Card | 30 min | Low |
| Phase 8: Testing & Polish | 1 hour | Medium |

**Total Estimated Time**: ~7 hours

---

## ✅ Ready to Implement?

Once you approve this plan, I will proceed with implementation in the following order:

1. ✅ Extend Prisma schema and migrate database
2. ✅ Set up environment variables and OpenRouter client
3. ✅ Build backend API routes
4. ✅ Create AI context builder and system prompts
5. ✅ Develop frontend chat components
6. ✅ Create chat page route
7. ✅ Update device card with AI Chat button
8. ✅ Test thoroughly and polish UI

Please review this plan and let me know:
- ✅ **Approve** - Start implementation as planned
- 🔄 **Revise** - Suggest changes to the plan
- ❓ **Questions** - Clarify any sections

Looking forward to your feedback! 🚀
