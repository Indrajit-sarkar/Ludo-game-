# 🏗️ Ludo Arena Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  (Desktop, Laptop, Tablet, Phone, Smartwatch)                   │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  │   Player 1   │  │   Player 2   │  │   Player 3   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          │    HTTPS         │    HTTPS         │    HTTPS
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL (Hosting)                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Next.js Application                            │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Frontend   │  │  API Routes  │  │  Game Engine │    │ │
│  │  │              │  │              │  │              │    │ │
│  │  │ • React UI   │  │ • Room APIs  │  │ • Rules      │    │ │
│  │  │ • 3D Board   │  │ • Game APIs  │  │ • Validation │    │ │
│  │  │ • Chat UI    │  │ • Chat APIs  │  │ • Logic      │    │ │
│  │  │ • Timers     │  │              │  │              │    │ │
│  │  └──────────────┘  └──────┬───────┘  └──────────────┘    │ │
│  │                            │                                │ │
│  └────────────────────────────┼────────────────────────────────┘ │
│                               │                                   │
│                               │                                   │
│  ┌────────────────────────────┼────────────────────────────────┐ │
│  │         Vercel KV (Storage)│                                │ │
│  │                            │                                │ │
│  │  ┌──────────────────────────▼─────────────────────────────┐│ │
│  │  │  Redis Database                                         ││ │
│  │  │                                                          ││ │
│  │  │  • Room States                                          ││ │
│  │  │  • Player Data                                          ││ │
│  │  │  • Game Progress                                        ││ │
│  │  │  • TTL: 2 hours                                         ││ │
│  │  └──────────────────────────────────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            │ WebSocket
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PUSHER (Real-Time)                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Pusher Channels                                │ │
│  │                                                              │ │
│  │  Room Channel: presence-room-XXXXXX                         │ │
│  │                                                              │ │
│  │  Events:                                                     │ │
│  │  • player-joined                                            │ │
│  │  • game-started                                             │ │
│  │  • dice-rolled                                              │ │
│  │  • token-moved                                              │ │
│  │  • chat-message                                             │ │
│  │  • turn-skipped                                             │ │
│  │  • game-over                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Room Creation Flow
```
Player 1 Browser
    │
    │ POST /api/room/create
    ▼
Next.js API Route
    │
    │ Generate room code
    │ Create game state
    ▼
Vercel KV
    │
    │ Store room data
    │ Return room ID
    ▼
Player 1 Browser
    │
    │ Navigate to /room/XXXXXX
    │ Subscribe to Pusher channel
    ▼
Pusher
    │
    │ Join presence-room-XXXXXX
    ▼
Waiting for players...
```

### 2. Room Joining Flow
```
Player 2 Browser
    │
    │ Enter room code: XXXXXX
    │ POST /api/room/join
    ▼
Next.js API Route
    │
    │ Validate room exists
    │ Add player to room
    ▼
Vercel KV
    │
    │ Update room state
    │ Return updated state
    ▼
Pusher
    │
    │ Broadcast 'player-joined' event
    ▼
All Players
    │
    │ Receive updated state
    │ UI updates automatically
    ▼
Both players see each other
```

### 3. Game Action Flow (Dice Roll)
```
Player 1 Browser
    │
    │ Click "Roll Dice"
    │ POST /api/game/roll-dice
    ▼
Next.js API Route
    │
    │ Validate it's player's turn
    │ Generate random dice value
    │ Calculate valid moves
    ▼
Vercel KV
    │
    │ Update game state
    │ Store dice value
    ▼
Pusher
    │
    │ Broadcast 'dice-rolled' event
    ▼
All Players
    │
    │ Receive dice value
    │ UI shows dice animation
    │ Highlight valid tokens
    ▼
Players see synchronized state
```

### 4. Chat Message Flow
```
Player 1 Browser
    │
    │ Type message
    │ POST /api/chat/send
    ▼
Next.js API Route
    │
    │ Create message object
    │ Add timestamp
    ▼
Pusher
    │
    │ Broadcast 'chat-message' event
    ▼
All Players
    │
    │ Receive message
    │ Play notification sound
    │ Show toast notification
    │ Add to chat panel
    ▼
All players see message
```

---

## Component Architecture

```
app/
├── page.tsx (Landing Page)
│   └── LobbyScreen
│       ├── ThemeToggle
│       ├── Name Input
│       ├── Mode Selection
│       └── Create/Join Buttons
│
└── room/[roomId]/page.tsx (Game Room)
    ├── WaitingRoom (phase: waiting)
    │   ├── Room Code Display
    │   ├── Player List
    │   └── Start Button
    │
    └── GameBoard (phase: rolling/moving/finished)
        ├── ThemeToggle
        ├── GameTimer
        ├── TurnTimer
        ├── ChatButton
        ├── ChatPanel
        ├── MessageNotification
        ├── Scene (3D)
        │   ├── Board3D
        │   ├── Token3D (x16)
        │   └── Dice3D
        ├── TurnIndicator
        ├── PlayerPanel (x4)
        ├── DiceButton
        └── Scoreboard (phase: finished)
```

---

## State Management

### Client State (Zustand)

```typescript
// Game State Store
useGameStore {
  roomId: string
  playerId: string
  gameState: GameState
  isMyTurn: boolean
  myColor: PlayerColor
  isDiceRolling: boolean
  error: string | null
  
  actions: {
    rollDice()
    moveToken()
    startGame()
  }
}

// Chat State Store
useChatStore {
  messages: ChatMessage[]
  unreadCount: number
  isChatOpen: boolean
  
  actions: {
    addMessage()
    editMessage()
    deleteMessage()
    toggleChat()
  }
}

// Timer State Store
useTimerStore {
  startTime: number
  elapsedSeconds: number
  isRunning: boolean
  
  actions: {
    startTimer()
    stopTimer()
    tick()
  }
}

// Turn Timer Store
useTurnTimerStore {
  timeLeft: number
  isActive: boolean
  missedTurns: Map<string, number>
  
  actions: {
    startTurnTimer()
    stopTurnTimer()
    tick()
  }
}

// Theme Context
ThemeContext {
  theme: 'light' | 'dark'
  toggleTheme()
}
```

### Server State (Vercel KV)

```typescript
// Stored in Redis
room:XXXXXX {
  id: string
  state: GameState {
    roomId: string
    players: Player[]
    currentTurn: PlayerColor
    diceValue: number | null
    phase: GamePhase
    mode: '2-player' | '4-player'
    // ... more fields
  }
  createdAt: number
  maxPlayers: number
}

// TTL: 2 hours (auto-cleanup)
```

---

## API Routes

### Room Management
- `POST /api/room/create` - Create new room
- `POST /api/room/join` - Join existing room
- `POST /api/room/start` - Start game
- `GET /api/room/state` - Get room state

### Game Actions
- `POST /api/game/roll-dice` - Roll dice
- `POST /api/game/move` - Move token
- `POST /api/game/skip-turn` - Skip turn (timeout)

### Chat
- `POST /api/chat/send` - Send message

### Pusher
- `POST /api/pusher/auth` - Authenticate channel

---

## Real-Time Events

### Pusher Channel: `presence-room-XXXXXX`

**Events Sent by Server:**
- `player-joined` - New player joined
- `game-started` - Game began
- `dice-rolled` - Dice was rolled
- `token-moved` - Token was moved
- `chat-message` - Chat message sent
- `turn-skipped` - Turn was skipped
- `game-over` - Game finished
- `player-left` - Player disconnected

**Events Handled by Client:**
- All above events update local state
- UI re-renders automatically
- Animations triggered

---

## Security

### Server-Side Validation
```
Client Request
    │
    ▼
API Route
    │
    ├─ Validate room exists
    ├─ Validate player ID
    ├─ Validate it's player's turn
    ├─ Validate move is legal
    ├─ Validate game phase
    │
    ▼
Execute Action
    │
    ▼
Update State
    │
    ▼
Broadcast to All
```

### Anti-Cheat Measures
- All game logic on server
- Cryptographic dice (crypto.getRandomValues)
- Move validation
- Turn enforcement
- Sequence numbers
- Server-authoritative state

---

## Performance Optimizations

### Frontend
- Dynamic imports for 3D components
- Lazy loading for heavy components
- Memoization with React.memo
- Debounced API calls
- Optimistic UI updates

### Backend
- Redis caching (Vercel KV)
- Efficient data structures
- Minimal payload sizes
- Connection pooling (Pusher)
- Auto-cleanup (TTL)

### Network
- WebSocket for real-time (Pusher)
- HTTP/2 (Vercel)
- CDN caching (Vercel Edge)
- Gzip compression
- Image optimization

---

## Scalability

### Current Limits (Free Tier)
- **Vercel**: 100GB bandwidth/month
- **Pusher**: 200K messages/day, 100 concurrent connections
- **Vercel KV**: 30K commands/month, 256MB storage

### Estimated Capacity
- **Concurrent Games**: ~50 games
- **Daily Users**: ~1,000 users
- **Monthly Users**: ~10,000 users

### When to Upgrade
- Vercel: >100GB bandwidth (~10K daily users)
- Pusher: >200K messages/day (~5K concurrent games)
- Vercel KV: >30K commands/month (~1K daily users)

---

## Monitoring

### Vercel Dashboard
- Deployment status
- Function logs
- Analytics
- Error tracking

### Pusher Dashboard
- Connection count
- Message count
- Channel activity
- Error logs

### Vercel KV Dashboard
- Command count
- Storage usage
- Response times
- Error rate

---

## Deployment Pipeline

```
Developer
    │
    │ git push origin main
    ▼
GitHub
    │
    │ Webhook trigger
    ▼
Vercel
    │
    ├─ Pull code
    ├─ Install dependencies
    ├─ Run build (npm run build)
    ├─ Run tests (if any)
    ├─ Deploy to Edge Network
    │
    ▼
Production
    │
    ├─ Automatic HTTPS
    ├─ CDN distribution
    ├─ Environment variables injected
    │
    ▼
Live at: your-app.vercel.app
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 | UI framework |
| Framework | Next.js 16 | Full-stack framework |
| 3D Graphics | Three.js | 3D rendering |
| 3D React | React Three Fiber | React + Three.js |
| Animations | Framer Motion | UI animations |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| State | Zustand | Client state management |
| Real-Time | Pusher Channels | WebSocket communication |
| Storage | Vercel KV | Redis database |
| Hosting | Vercel | Serverless hosting |
| Language | TypeScript 5 | Type safety |

---

## File Structure

```
ludo-game/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── room/            # Room management
│   │   ├── game/            # Game actions
│   │   ├── chat/            # Chat system
│   │   └── pusher/          # Pusher auth
│   ├── room/[roomId]/       # Dynamic game room
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── chat/               # Chat UI
│   ├── game/               # Game UI
│   ├── lobby/              # Lobby UI
│   ├── three/              # 3D components
│   └── ui/                 # Reusable UI
├── contexts/               # React contexts
│   └── ThemeContext.tsx    # Theme provider
├── game-engine/            # Game logic
│   ├── engine.ts           # Core rules
│   ├── validation.ts       # Move validation
│   ├── constants.ts        # Game constants
│   └── types.ts            # TypeScript types
├── hooks/                  # Custom hooks
│   ├── useGameState.ts     # Game state
│   ├── useChat.ts          # Chat state
│   ├── useTimer.ts         # Timers
│   ├── usePusher.ts        # Real-time
│   └── useSound.ts         # Sound effects
├── lib/                    # Utilities
│   ├── room-store-kv.ts    # KV storage
│   ├── pusher-client.ts    # Pusher client
│   ├── pusher-server.ts    # Pusher server
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

---

**Last Updated**: 2026-04-06  
**Version**: 2.0.0
