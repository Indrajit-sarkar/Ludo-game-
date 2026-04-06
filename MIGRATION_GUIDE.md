# Migration Guide - Ludo Arena v2.0

## Overview
This guide covers the major updates and breaking changes in Ludo Arena v2.0.

## New Dependencies

The following packages have been added:

```json
{
  "react-hot-toast": "^2.4.1",
  "socket.io-client": "^4.7.2",
  "@heroicons/react": "^2.1.1"
}
```

Install them with:
```bash
npm install
```

## New Features

### 1. Theme System
- Added dark/light mode toggle
- Theme persists in localStorage
- Smooth transitions between themes

**Usage:**
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, toggleTheme } = useTheme();
```

### 2. Chat System
- Real-time messaging
- Emoji support
- Message editing/deletion
- Reactions

**Usage:**
```tsx
import { useChatStore } from '@/hooks/useChat';

const { messages, addMessage, toggleChat } = useChatStore();
```

### 3. Timer System
- Game timer (total duration)
- Turn timer (15s per turn)
- Auto-skip on timeout
- Disqualification after 5 missed turns

**Usage:**
```tsx
import { useGameTimer } from '@/hooks/useTimer';
import { useTurnTimerStore } from '@/hooks/useTurnTimer';

const { elapsedSeconds } = useGameTimer();
const { timeLeft } = useTurnTimerStore();
```

### 4. Scoreboard
- Final rankings
- Medal system
- Rematch functionality

**Usage:**
```tsx
import { Scoreboard } from '@/components/game/Scoreboard';

<Scoreboard
  show={showScoreboard}
  onRematch={handleRematch}
  onExit={handleExit}
  gameDuration={elapsedSeconds}
/>
```

## Breaking Changes

### 1. Layout Component
The root layout now requires ThemeProvider:

**Before:**
```tsx
<html lang="en" className="dark">
  <body>{children}</body>
</html>
```

**After:**
```tsx
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider>{children}</ThemeProvider>
  </body>
</html>
```

### 2. Global Styles
Added responsive design and theme support:

- Removed fixed `bg-[#0a0a1a]` from body
- Added CSS variables for theming
- Added responsive font sizes
- Added touch feedback styles

### 3. PlayerPanel Component
Added `compact` prop for mobile layouts:

**Before:**
```tsx
<PlayerPanel player={player} isCurrentTurn={isCurrentTurn} />
```

**After:**
```tsx
<PlayerPanel 
  player={player} 
  isCurrentTurn={isCurrentTurn}
  compact={isMobile} // optional
/>
```

### 4. Room Joining
Fixed room code normalization:

- Room codes now automatically converted to uppercase
- Better error messages
- Improved validation

## API Changes

### Room Join Endpoint
Now normalizes room IDs:

```typescript
// Before
const room = getRoom(roomId);

// After
const normalizedRoomId = roomId.trim().toUpperCase();
const room = getRoom(normalizedRoomId);
```

## Component Updates

### GameBoard
Major updates:
- Added chat integration
- Added timer components
- Added theme toggle
- Responsive player panels
- Mobile-optimized layout

### LobbyScreen
Updates:
- Theme toggle button
- Responsive design
- Touch feedback
- Light mode support

## Styling Updates

### Tailwind Classes
New utility classes added:

```css
.touch-feedback:active { transform: scale(0.95); }
.hover-lift:hover { transform: translateY(-2px); }
.hover-glow:hover { box-shadow: 0 0 20px currentColor; }
.hover-scale:hover { transform: scale(1.05); }
```

### Theme Classes
Use theme-aware classes:

```tsx
// Before
className="bg-white/10 text-white"

// After
className="bg-white/10 dark:bg-white/10 light:bg-black/10 
           text-white dark:text-white light:text-gray-900"
```

## Migration Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Update Layout
Wrap your app with ThemeProvider in `app/layout.tsx`

### Step 3: Update Components
Add theme-aware classes to your components

### Step 4: Test Responsiveness
Test on different devices and screen sizes

### Step 5: Test Browsers
Verify functionality in all supported browsers

## Testing Checklist

- [ ] Room creation works
- [ ] Room joining works (with uppercase codes)
- [ ] Theme toggle works
- [ ] Chat sends/receives messages
- [ ] Timers count correctly
- [ ] Scoreboard displays properly
- [ ] Mobile layout is responsive
- [ ] Touch gestures work on mobile
- [ ] All browsers render correctly

## Rollback Plan

If you need to rollback:

1. Revert to previous commit:
```bash
git revert HEAD
```

2. Reinstall old dependencies:
```bash
npm install
```

3. Clear localStorage:
```javascript
localStorage.clear();
```

## Support

For issues or questions:
1. Check FEATURES.md for feature documentation
2. Review this migration guide
3. Open a GitHub issue

## Performance Notes

- Theme switching is instant (no page reload)
- Chat messages are optimized with virtualization
- Timers use efficient intervals
- Responsive design uses CSS media queries (no JS)

## Accessibility

New accessibility features:
- Keyboard navigation for chat
- Screen reader support for timers
- High contrast mode support
- Touch target sizes meet WCAG guidelines

## Security

- Input sanitization for chat messages
- XSS protection
- Rate limiting on API endpoints (recommended)
- Secure WebSocket connections

## Next Steps

After migration:
1. Monitor error logs
2. Gather user feedback
3. Test on real devices
4. Optimize performance
5. Plan next features

## Version History

- **v2.0.0**: Major update with chat, timers, themes
- **v1.0.0**: Initial release

## Credits

Built with:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- Pusher
