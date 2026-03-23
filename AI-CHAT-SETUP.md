# AI Chat Feature Setup Guide

## 🎯 Overview

The AI Chat feature allows users to have natural language conversations with JalRakshak AI about their water quality monitoring device data. The AI has access to complete historical readings and can provide insights, trend analysis, and recommendations.

## 🚀 Quick Setup

### 1. Install Dependencies

The required dependency (`react-markdown`) has already been installed. If you encounter issues, run:

```bash
npm install react-markdown
```

### 2. Configure Environment Variables

Add your OpenRouter API key to `.env.local`:

```bash
# Get your API key from https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Optional: Site info for rankings
OPENROUTER_SITE_URL=https://jalrakshak-ai.vercel.app
OPENROUTER_SITE_NAME=JalRakshak AI
```

**How to get an API key:**
1. Visit https://openrouter.ai/
2. Sign up or log in
3. Go to https://openrouter.ai/keys
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

### 3. Generate Prisma Client

The Prisma schema has been updated with the `ChatMessage` model. You need to regenerate the Prisma client:

**Important:** Close your dev server first (Ctrl+C) if it's running, then:

```bash
npx prisma generate
```

If you encounter a Windows file lock error, restart your terminal/IDE and try again.

### 4. Verify Database Schema

Check that the `chat_messages` collection was created in MongoDB:

```bash
npx prisma studio
```

You should see a new `ChatMessage` model in Prisma Studio.

### 5. Start Development Server

```bash
npm run dev
```

## 🎨 Features Implemented

### ✅ Phase 1: Database Schema
- Added `ChatMessage` model to Prisma schema
- Created `chat_messages` collection in MongoDB
- Linked to `Device` model via `deviceId`

### ✅ Phase 2: Backend API Routes
- **`/api/device/[deviceId]/context`** - Fetches device metadata + readings
- **`/api/chat/history/[deviceId]`** - Retrieves chat history
- **`/api/chat`** - Main chat completion endpoint (calls OpenRouter API)

### ✅ Phase 3: AI Context & Prompts
- `lib/openrouter.ts` - OpenRouter API client
- `lib/chat-context.ts` - Builds rich context from device data
- `lib/chat-prompts.ts` - System prompts and welcome message

### ✅ Phase 4: Frontend Components
- `components/chat/chat-message.tsx` - Message bubbles with markdown support
- `components/chat/chat-input.tsx` - Input field with send button
- `components/chat/chat-suggestions.tsx` - Quick question chips
- `components/chat/chat-header.tsx` - Device info header
- `components/chat/chat-interface.tsx` - Main chat container

### ✅ Phase 5: Chat Page Route
- **`/device/[deviceId]/chat`** - Full-screen chat interface

### ✅ Phase 6: Device Card Integration
- Added "AI Chat" button below "View AI Analysis" in device cards
- Button styled with primary color accent

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Navigate to main dashboard
- [ ] Click "AI Chat" button on any device card
- [ ] Chat page loads without errors
- [ ] Welcome message displays
- [ ] Quick suggestion chips are clickable
- [ ] Typing in input field works
- [ ] Pressing Enter sends message
- [ ] AI responds with relevant insights
- [ ] Messages display with correct styling
- [ ] Back button returns to dashboard

### AI Context Verification
- [ ] Ask "What's the latest pH reading?"
- [ ] Verify AI cites actual values from device
- [ ] Ask "Show me the trend over the last week"
- [ ] Verify AI references specific dates and values
- [ ] Ask about device location
- [ ] AI should ask for location if not provided

### Error Handling
- [ ] Disconnect internet → Send message → Error message displays
- [ ] Invalid API key → Helpful error message
- [ ] Device with no readings → AI acknowledges no data

### UI/UX
- [ ] Messages auto-scroll to bottom
- [ ] Loading indicator shows while waiting for AI
- [ ] User messages align right (blue background)
- [ ] AI messages align left (gray background)
- [ ] Markdown rendering works (bold, lists)
- [ ] Timestamps display correctly
- [ ] Chat history persists on page refresh

## 🐛 Troubleshooting

### Issue: Prisma errors about `chatMessage`
**Solution:** Close dev server and run:
```bash
npx prisma generate
npm run dev
```

### Issue: "OPENROUTER_API_KEY is not set"
**Solution:** Add your API key to `.env.local` (see step 2 above)

### Issue: AI responses are slow
**Expected:** First response may take 5-10 seconds (cold start on free tier)
**Tip:** Subsequent responses are faster (~2-3 seconds)

### Issue: Chat history not loading
**Check:**
1. MongoDB connection is working (`npm run db-test` if you have that script)
2. Device exists in database
3. Console errors in browser DevTools

### Issue: Messages not saving to database
**Check:**
1. Prisma client was regenerated after schema changes
2. MongoDB connection string in `.env.local` is correct
3. Check API route logs in terminal

## 📊 AI Capabilities

The JalRakshak AI assistant can:

### 1. Trend Analysis
- "What's the pH trend over the last week?"
- "How has TDS changed over time?"
- "Show me temperature fluctuations"

### 2. Anomaly Detection
- "Were there any unusual readings?"
- "When was the last unsafe reading?"
- "What caused the TDS spike on March 20?"

### 3. Root Cause Analysis
- "Why is turbidity suddenly high?"
- "What could cause this pH drop?"
- Considers location, geology, industrial factors

### 4. Safety Assessment
- "Is my water safe to drink?"
- "What's the risk level right now?"
- "Should I be concerned about these readings?"

### 5. Recommendations
- "How can I improve water quality?"
- "Do I need a filter?"
- "What treatment method should I use?"

### 6. Educational
- "What does TDS mean?"
- "Why is pH important?"
- "What are safe ranges for turbidity?"

## 🎨 UI Customization

### Change AI Avatar
Edit `components/chat/chat-message.tsx`:
```tsx
<Bot className="h-4 w-4 text-primary" />
// Replace with your custom icon
```

### Modify Welcome Message
Edit `lib/chat-prompts.ts`:
```tsx
export const WELCOME_MESSAGE = `Your custom welcome message...`;
```

### Add/Remove Suggestion Chips
Edit `lib/chat-prompts.ts`:
```tsx
export const SUGGESTED_QUESTIONS = [
  { icon: "📊", text: "Your question", prompt: "Full prompt..." },
  // Add more...
];
```

### Change Color Scheme
The chat UI uses your existing design tokens. To customize:
- User messages: Uses `--primary` color
- AI messages: Uses `--muted` background
- Edit `app/globals.css` to change theme colors

## 🚀 Production Deployment

### Vercel Environment Variables
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_SITE_URL=https://jalrakshak-ai.vercel.app
OPENROUTER_SITE_NAME=JalRakshak AI
```

### Database Migration
Prisma schema changes are already pushed to MongoDB. No additional migration needed.

### Build & Deploy
```bash
git add .
git commit -m "feat: Add AI chat interface for device analysis"
git push origin main
```

Vercel will automatically deploy.

## 📈 Usage Metrics

### OpenRouter Free Tier Limits
- **Model:** meta-llama/llama-3.3-70b-instruct:free
- **Rate Limit:** 20 requests/minute
- **Cost:** Free (with rate limits)

### Monitoring
- Check usage at https://openrouter.ai/activity
- Monitor token usage in chat API response
- Saved in database: `tokensUsed` field

## 🔮 Future Enhancements

Potential improvements (not implemented in MVP):

1. **Streaming Responses** - Use Server-Sent Events for real-time token streaming
2. **Voice Input** - Add speech-to-text for voice queries
3. **Multi-device Comparison** - Compare trends across devices
4. **Export Chat** - Download conversation as PDF
5. **Scheduled Reports** - Weekly AI-generated summaries
6. **Custom System Prompts** - Let users customize AI personality

## 📚 Resources

- **OpenRouter Docs:** https://openrouter.ai/docs
- **Llama 3.3 Model:** https://openrouter.ai/models/meta-llama/llama-3.3-70b-instruct:free
- **React Markdown:** https://github.com/remarkjs/react-markdown
- **Prisma MongoDB:** https://www.prisma.io/docs/concepts/database-connectors/mongodb

## ✅ Success!

If you can:
1. Click "AI Chat" on a device card
2. Ask "What's the pH trend?"
3. Get a response with actual data from your device

**Congratulations!** 🎉 The AI chat feature is working correctly.

---

Need help? Check the console logs in both terminal and browser DevTools for error messages.
