# ⚡ Quick Setup Guide

## 🎯 Goal
Get your Ludo Arena game fully functional with all features working in under 30 minutes.

---

## ✅ Step 1: Install Vercel KV (2 minutes)

1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create Database"
4. Select "KV" (Key-Value Store)
5. Name it: `ludo-rooms`
6. Click "Create"
7. ✅ Done! Environment variables are auto-added

---

## ✅ Step 2: Set Up Pusher (5 minutes)

### Create Account
1. Go to https://pusher.com/
2. Click "Sign Up" (FREE)
3. Use GitHub or email

### Create App
1. Dashboard → "Create app"
2. Name: `ludo-arena`
3. Cluster: Choose closest (e.g., `us2`, `eu`, `ap1`)
4. Frontend: React
5. Backend: Node.js
6. Click "Create app"

### Get Credentials
1. Go to "App Keys" tab
2. Copy these 4 values:
   - `app_id`
   - `key`
   - `secret`
   - `cluster`

### Add to Vercel
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these 4 variables:
   ```
   PUSHER_APP_ID=your_app_id_here
   PUSHER_SECRET=your_secret_here
   NEXT_PUBLIC_PUSHER_KEY=your_key_here
   NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster_here
   ```
3. Click "Save" for each

---

## ✅ Step 3: Install Dependencies (2 minutes)

```bash
cd ludo-game
npm install @vercel/kv
```

---

## ✅ Step 4: Update Code (5 minutes)

### Update API Routes

Replace imports in these 6 files:

**Files to update:**
1. `app/api/room/create/route.ts`
2. `app/api/room/join/route.ts`
3. `app/api/room/start/route.ts`
4. `app/api/room/state/route.ts`
5. `app/api/game/roll-dice/route.ts`
6. `app/api/game/move/route.ts`

**Change this line:**
```typescript
import { getRoom, updateRoomState, createRoom } from '@/lib/room-store';
```

**To this:**
```typescript
import { getRoom, updateRoomState, createRoom } from '@/lib/room-store-kv';
```

### Quick Find & Replace
Use your editor's find & replace:
- Find: `from '@/lib/room-store'`
- Replace: `from '@/lib/room-store-kv'`
- Files: `app/api/**/*.ts`

---

## ✅ Step 5: Deploy (2 minutes)

```bash
git add .
git commit -m "feat: Add Vercel KV and Pusher integration"
git push origin main
```

Vercel will auto-deploy in ~2 minutes.

---

## ✅ Step 6: Test (5 minutes)

### Test Checklist
1. Visit your Vercel URL
2. Create a room
3. Copy room code
4. Open in incognito/another browser
5. Join with code
6. Start game
7. Test chat
8. Test dice roll
9. Test token movement
10. Check timers

---

## 🎉 You're Done!

All features should now work:
- ✅ Room creation/joining
- ✅ Real-time game sync
- ✅ Chat messaging
- ✅ Game timer
- ✅ Turn timer
- ✅ Theme toggle
- ✅ Responsive design

---

## 🐛 Troubleshooting

### "Room not found" error
- Check Vercel KV is created
- Redeploy after adding KV

### Chat not working
- Verify Pusher credentials in Vercel
- Check all 4 variables are set
- Redeploy

### Build fails
- Run `npm install @vercel/kv`
- Check for TypeScript errors: `npm run build`
- Push again

---

## 📊 Verify Setup

### Check Environment Variables
Vercel Dashboard → Settings → Environment Variables

Should have:
- `KV_REST_API_URL` (auto-added by Vercel KV)
- `KV_REST_API_TOKEN` (auto-added by Vercel KV)
- `PUSHER_APP_ID` (you added)
- `PUSHER_SECRET` (you added)
- `NEXT_PUBLIC_PUSHER_KEY` (you added)
- `NEXT_PUBLIC_PUSHER_CLUSTER` (you added)

### Check Deployment
Vercel Dashboard → Deployments → Latest

Should show:
- ✅ Build successful
- ✅ All checks passed

---

## 💡 Pro Tips

1. **Local Testing**
   ```bash
   npm install -g vercel
   vercel dev
   ```
   This pulls environment variables from Vercel

2. **Monitor Usage**
   - Pusher: Dashboard → Analytics
   - Vercel KV: Vercel → Storage → Your KV

3. **Debug Logs**
   - Vercel: Dashboard → Deployments → View Function Logs
   - Browser: F12 → Console

---

## 🆘 Still Having Issues?

1. Check deployment logs in Vercel
2. Check browser console (F12)
3. Verify all 6 environment variables
4. Try redeploying: `vercel --prod`

---

**Estimated Total Time**: 20-30 minutes  
**Cost**: $0 (100% free tier)
