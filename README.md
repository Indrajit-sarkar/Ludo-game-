# 🎲 Ludo Arena — Multiplayer 3D Ludo Game

A production-ready multiplayer Ludo game built with **Next.js 16**, **React Three Fiber**, **Pusher**, and **Tailwind CSS v4**.

> **🎉 NEW in v2.0**: Dark/Light themes, Real-time chat, Game timers, Scoreboard, Full responsive design, and more! See [UPGRADE_SUMMARY.md](./UPGRADE_SUMMARY.md) for details.

---

## ✨ Features

### v2.0 Features
- 🌓 **Dark/Light Theme** — Toggle between themes with smooth transitions
- 💬 **Real-Time Chat** — Message other players with emoji support
- ⏱️ **Timer System** — Game timer and 15-second turn countdown
- 🏆 **Scoreboard** — Rankings with medals and statistics
- 📱 **Fully Responsive** — Optimized for all devices and browsers
- 🎨 **Enhanced UI/UX** — Hover effects, touch feedback, animations

### Core Features
- 🎮 **3D Game Board** — Procedurally generated using React Three Fiber
- 🎲 **Animated Dice** — 3D spinning dice with dot textures
- ♟️ **Animated Tokens** — Smooth movement, bounce, glow effects
- 🌐 **Real-time Multiplayer** — Pusher-powered room-based play
- 👥 **2-Player & 4-Player** modes
- 🔐 **Server-Authoritative** — All logic validated server-side (anti-cheat)
- 🎯 **Cryptographic Dice** — `crypto.getRandomValues()` + rejection sampling
- 📋 **Full Ludo Rules** — Captures, safe zones, home paths, exact-roll finish
- 🔊 **Sound Effects** — Synthesized via Web Audio API
- 💎 **Glassmorphism UI** — Modern premium design with Framer Motion

---

## 🚀 Quick Start

```bash
cd ludo-game
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The game ships with mock Pusher credentials for local testing.  
> For real multiplayer, see **Pusher Setup** below.

---

## 🔧 Pusher Setup (Multiplayer)

1. Create a free account at [pusher.com](https://pusher.com)
2. Create a new **Channels** app
3. Copy credentials and update `.env.local`:

```env
PUSHER_APP_ID=your_app_id
PUSHER_APP_SECRET=your_secret
NEXT_PUBLIC_PUSHER_APP_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

Free tier: 100 concurrent connections, 200K daily messages.

---

## 🌍 Deploy to Vercel

1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add the 4 Pusher environment variables
4. Deploy — zero config needed!

---

## 🏗️ Architecture

```
├── app/                    # Next.js App Router
│   ├── api/game/           # Dice roll & move APIs
│   ├── api/room/           # Room create/join/start/state
│   ├── api/pusher/         # Pusher auth endpoint
│   ├── room/[roomId]/      # Dynamic game room page
│   └── page.tsx            # Landing lobby
├── components/
│   ├── three/              # 3D: Board, Tokens, Dice, Scene
│   ├── game/               # GameBoard, PlayerPanel, TurnIndicator, WinnerPopup
│   ├── lobby/              # LobbyScreen, WaitingRoom
│   └── ui/                 # DiceButton
├── game-engine/            # Server-side game logic
│   ├── engine.ts           # Core rules (captures, turns, winner)
│   ├── dice.ts             # Cryptographic dice
│   ├── validation.ts       # Move validation (anti-cheat)
│   ├── constants.ts        # Board layout & coordinates
│   └── types.ts            # TypeScript interfaces
├── hooks/                  # useGameState (Zustand), usePusher, useSound
└── lib/                    # Pusher singletons, room store, utils
```

### Key Decisions

| Decision | Why |
|----------|-----|
| Server-authoritative | Prevents cheating — clients send intents, server validates |
| Pusher Channels | Vercel can't run WebSocket servers; Pusher provides real-time via serverless |
| Procedural 3D | No external model files; board/tokens/dice generated from code |
| Rejection sampling | Uniform dice distribution without modulo bias |
| In-memory store | Simple for dev; swap to Vercel KV / Redis for production |

---

## 🎮 Game Rules

| Rule | Detail |
|------|--------|
| Start | Roll 6 to release a token from yard |
| Movement | Clockwise around 52-cell track |
| Extra Turn | Rolling 6 grants another turn |
| Three 6s | Three consecutive 6s = lose turn |
| Capture | Land on opponent → they go back to yard |
| Safe Zones | 8 protected positions (starts + stars) |
| Home Path | Color-exclusive column to center |
| Exact Roll | Must roll exact number to finish |
| Winning | First to get all 4 tokens home |

---

## 🔒 Security

- Server-generated dice via `crypto.getRandomValues()`
- Every move validated against game rules
- Turn enforcement — rejects out-of-turn actions
- Sequence numbers prevent replay attacks
- Pusher presence channels require server auth

---

## 🛠️ Tech Stack

Next.js 16 · TypeScript 5 · React Three Fiber · Drei · Tailwind CSS v4 · Framer Motion · Pusher Channels · Zustand

---

## 📄 License

MIT
