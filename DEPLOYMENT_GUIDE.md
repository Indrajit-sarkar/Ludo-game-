# 🚀 Deployment & Backend Integration Guide

## Current Status
✅ Deployed on Vercel  
✅ GitHub repository connected  
⏳ Backend integrations pending

---

## 🔧 Required Free Services Setup

### 1. Pusher (Real-Time Communication) - FREE TIER

**What it's for**: Real-time chat, game state updates, player presence

**Free Tier Limits**:
- 100 concurrent connections
- 200,000 messages/day
- Unlimited channels

**Setup Steps**:

1. **Create Pusher Account**
   - Go to https://pusher.com/
   - Click "Sign Up" (free)
   - Choose "Channels" product

2. **Create New App**
   - Dashboard → "Create app"
   - Name: `ludo-arena`
   - Cluster: Choose closest to your users (e.g., `us2`, `eu`, `ap1`)
   - Frontend: Select "React"
   - Backend: Select "Node.js"
   - Click "Create app"

3. **Get Credentials**
   - Go to "App Keys" tab
   - Copy these values:
     - `app_id`
     - `key`
     - `secret`
     - `cluster`

4. **Add to Vercel Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add these variables:
     ```
     PUSHER_APP_ID=your_app_id
     PUSHER_SECRET=your_secret
     NEXT_PUBLIC_PUSHER_KEY=your_key
     NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
     ```
   - Click "Save"
   - Redeploy your app (Vercel will auto-redeploy)

5. **Verify Setup**
   - Your `.env.local` file should have:
     ```env
     PUSHER_APP_ID=your_app_id
     PUSHER_SECRET=your_secret
     NEXT_PUBLIC_PUSHER_KEY=your_key
     NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
     ```

---

### 2. Upstash Redis (Game State Storage) - FREE TIER

**What it's for**: Persistent room storage (replaces in-memory store)

**Free Tier Limits**:
- 10,000 commands/day
- 256 MB storage
- Global replication

**Setup Steps**:

1. **Create Upstash Account**
   - Go to https://upstash.com/
   - Click "Sign Up" (free, use GitHub login)

2. **Create Redis Database**
   - Dashboard → "Create Database"
   - Name: `ludo-game-rooms`
   - Type: "Regional" (free)
   - Region: Choose closest to your Vercel region
   - Click "Create"

3. **Get Connection Details**
   - Click on your database
   - Copy "REST API" credentials:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

4. **Add to Vercel**
   - Vercel Dashboard → Settings → Environment Variables
   - Add:
     ```
     UPSTASH_REDIS_REST_URL=your_url
     UPSTASH_REDIS_REST_TOKEN=your_token
     ```

5. **Install Upstash SDK**
   ```bash
   npm install @upstash/redis
   ```

---

### 3. Vercel KV (Alternative to Upstash) - FREE TIER

**What it's for**: Same as Upstash, but integrated with Vercel

**Free Tier Limits**:
- 30,000 commands/month
- 256 MB storage

**Setup Steps**:

1. **Enable Vercel KV**
   - Vercel Dashboard → Your Project → Storage
   - Click "Create Database"
   - Select "KV"
   - Name: `ludo-rooms`
   - Click "Create"

2. **Auto-Configuration**
   - Vercel automatically adds environment variables
   - No manual setup needed!

3. **Install Vercel KV SDK**
   ```bash
   npm install @vercel/kv
   ```

**Choose ONE**: Either Upstash Redis OR Vercel KV (I recommend Vercel KV for simplicity)

---

## 📝 Code Implementation Steps

### Step 1: Update Room Store (Use Vercel KV)

Create `ludo-game/lib/room-store-kv.ts`:

```typescript
import { kv } from '@vercel/kv';
import { Room, GameState } from '@/game-engine/types';
import { createGameState } from '@/game-engine/engine';

const ROOM_TTL = 2 * 60 * 60; // 2 hours in seconds

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(mode: '2-player' | '4-player'): Promise<Room> {
  const id = generateRoomCode();
  
  // Check if room exists
  const exists = await kv.exists(`room:${id}`);
  if (exists) return createRoom(mode); // Retry with new code
  
  const room: Room = {
    id,
    state: createGameState(id, mode),
    createdAt: Date.now(),
    maxPlayers: mode === '2-player' ? 2 : 4,
  };

  await kv.set(`room:${id}`, JSON.stringify(room), { ex: ROOM_TTL });
  return room;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const data = await kv.get<string>(`room:${roomId.toUpperCase()}`);
  if (!data) return null;
  return JSON.parse(data);
}

export async function updateRoomState(roomId: string, state: GameState): Promise<void> {
  const room = await getRoom(roomId);
  if (!room) return;
  
  room.state = state;
  await kv.set(`room:${roomId.toUpperCase()}`, JSON.stringify(room), { ex: ROOM_TTL });
}

export async function deleteRoom(roomId: string): Promise<void> {
  await kv.del(`room:${roomId.toUpperCase()}`);
}

export async function roomExists(roomId: string): Promise<boolean> {
  return (await kv.exists(`room:${roomId.toUpperCase()}`)) === 1;
}
```

### Step 2: Update API Routes to Use KV

Update all API route imports:

```typescript
// Change this:
import { getRoom, updateRoomState } from '@/lib/room-store';

// To this:
import { getRoom, updateRoomState } from '@/lib/room-store-kv';
```

Files to update:
- `app/api/room/create/route.ts`
- `app/api/room/join/route.ts`
- `app/api/room/start/route.ts`
- `app/api/room/state/route.ts`
- `app/api/game/roll-dice/route.ts`
- `app/api/game/move/route.ts`

### Step 3: Implement Chat Broadcasting

Create `ludo-game/app/api/chat/send/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { broadcastGameState } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const { roomId, playerId, playerName, playerColor, message, emoji } = await request.json();

    if (!roomId || !playerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chatMessage = {
      id: Date.now().toString(),
      playerId,
      playerName,
      playerColor,
      message,
      emoji,
      timestamp: Date.now(),
      reactions: [],
    };

    // Broadcast to all clients in the room
    await broadcastGameState(roomId, 'chat-message', null, chatMessage);

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
```

### Step 4: Implement Turn Timer Auto-Skip

Create `ludo-game/app/api/game/skip-turn/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getRoom, updateRoomState } from '@/lib/room-store-kv';
import { nextTurn } from '@/game-engine/engine';
import { broadcastGameState } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const { roomId, playerId } = await request.json();

    const room = await getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Verify it's the current player's turn
    const currentPlayer = room.state.players.find(p => p.color === room.state.currentTurn);
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }

    // Move to next turn
    const updatedState = nextTurn(room.state);
    await updateRoomState(roomId, updatedState);

    // Broadcast
    await broadcastGameState(roomId, 'turn-skipped', updatedState, { playerId });

    return NextResponse.json({ state: updatedState });
  } catch (error) {
    console.error('Error skipping turn:', error);
    return NextResponse.json({ error: 'Failed to skip turn' }, { status: 500 });
  }
}
```

### Step 5: Update Chat Hook to Use API

Update `ludo-game/hooks/useChat.ts`:

```typescript
// Add this function
const broadcastMessage = async (roomId: string, message: ChatMessage) => {
  try {
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId,
        ...message,
      }),
    });
  } catch (error) {
    console.error('Failed to broadcast message:', error);
  }
};

// Update addMessage to broadcast
addMessage: (message) => {
  set((state) => ({
    messages: [...state.messages, message],
    unreadCount: state.isChatOpen ? 0 : state.unreadCount + 1,
  }));
  
  // Broadcast to other players
  const roomId = useGameStore.getState().roomId;
  if (roomId) {
    broadcastMessage(roomId, message);
  }
},
```

### Step 6: Update Pusher Hook to Listen for Chat

Update `ludo-game/hooks/usePusher.ts`:

Add chat message listener:

```typescript
// Add this inside the useEffect
channel.bind('chat-message', (data: any) => {
  const { addMessage } = useChatStore.getState();
  addMessage(data);
});
```

---

## 🔄 Deployment Steps

### After Code Changes:

1. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: Add Vercel KV storage and chat broadcasting"
   git push origin main
   ```

2. **Vercel Auto-Deploy**
   - Vercel will automatically detect the push
   - Build will start automatically
   - Check deployment status in Vercel dashboard

3. **Verify Environment Variables**
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure all variables are set:
     - Pusher credentials (4 variables)
     - Vercel KV (auto-added)

4. **Test Deployment**
   - Visit your Vercel URL
   - Create a room
   - Join from another device/browser
   - Test chat functionality
   - Test game timer

---

## 🧪 Testing Checklist

### Local Testing (Before Deploy):
```bash
# Install dependencies
npm install @vercel/kv

# Run locally with Vercel CLI
npm install -g vercel
vercel dev
```

### Production Testing:
- [ ] Room creation works
- [ ] Room joining with code works
- [ ] Chat messages send/receive
- [ ] Theme toggle persists
- [ ] Timers count correctly
- [ ] Game state syncs across players
- [ ] Mobile responsive design works

---

## 💰 Cost Breakdown (All FREE)

| Service | Free Tier | Usage Estimate | Cost |
|---------|-----------|----------------|------|
| Vercel | 100GB bandwidth/month | ~10GB/month | $0 |
| Pusher | 200K messages/day | ~50K/day | $0 |
| Vercel KV | 30K commands/month | ~10K/month | $0 |
| **TOTAL** | | | **$0/month** |

### When You'll Need to Upgrade:
- Vercel: >100GB bandwidth (~10,000 daily users)
- Pusher: >200K messages/day (~5,000 concurrent games)
- Vercel KV: >30K commands/month (~1,000 daily users)

---

## 🐛 Troubleshooting

### Issue: "Room not found" error
**Solution**: 
- Check Vercel KV is enabled
- Verify environment variables are set
- Redeploy after adding variables

### Issue: Chat messages not sending
**Solution**:
- Check Pusher credentials in Vercel
- Verify Pusher app is active
- Check browser console for errors

### Issue: Build fails on Vercel
**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally first

### Issue: Environment variables not working
**Solution**:
- Redeploy after adding variables
- Check variable names match exactly
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

---

## 📚 Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Pusher Channels Documentation](https://pusher.com/docs/channels)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🎯 Next Steps

1. ✅ Set up Pusher account
2. ✅ Enable Vercel KV
3. ✅ Add environment variables to Vercel
4. ✅ Implement code changes above
5. ✅ Commit and push to GitHub
6. ✅ Verify auto-deployment
7. ✅ Test all features

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test locally with `vercel dev` first

---

**Last Updated**: 2026-04-06  
**Version**: 2.0.0
