# 3D Pong Game

## Overview
A 3D version of the classic Pong game built with React Three Fiber. Features single-player gameplay against an AI opponent with keyboard controls, multiple paddle skins, and customizable game maps.

## Tech Stack
- React 18 with TypeScript
- Three.js via @react-three/fiber and @react-three/drei
- Zustand for state management
- Tailwind CSS for UI styling
- Express server for serving the application

## Project Structure
```
client/
  src/
    components/
      game/
        Court.tsx       - 3D court/playing field with dynamic map theming
        GameScene.tsx   - Main game scene with ball, paddles, physics
        GameHUD.tsx     - Score display, menus, game controls
        MainMenu.tsx    - Menu system with skins and maps subsections
        SoundManager.tsx - Audio initialization
      ui/               - Reusable UI components
    lib/
      stores/
        usePong.tsx     - Game state (scores, phase, winner)
        useSkins.tsx    - Paddle skins and game maps management
        useAudio.tsx    - Sound management
        useGame.tsx     - Generic game state (unused)
    App.tsx             - Main app with Canvas and controls
server/
  index.ts              - Express server entry
  routes.ts             - API routes
  vite.ts               - Vite dev server setup
```

## Game Features
- **3D Environment**: Court with walls, center line, and colored paddles
- **Keyboard Controls**: W/Arrow Up to move up, S/Arrow Down to move down
- **Mobile Touch Controls**: On-screen buttons for mobile devices
- **AI Opponent**: Tracks ball position with adjustable difficulty
- **Ball Physics**: Increases speed on paddle hits, bounces off walls
- **Ball Curving**: Move your paddle while hitting to curve the ball! The ball will curve in the direction you're moving
- **Scoring**: First to 5 points wins
- **Sound Effects**: Hit sounds on collisions (muted by default)
- **Game States**: Menu, Playing, Paused, Game Over
- **Responsive UI**: HUD adapts to mobile and desktop screen sizes
- **Paddle Skins**: 5 unique paddle designs (Default, Neon, Chrome, Fire, Ice)
- **Game Maps**: 5 themed court environments with unique color schemes
  - Neon Night (default) - Cyberpunk neon arena
  - Midnight - Dark and moody court
  - Sunset Paradise - Warm tropical court
  - Ocean Blue - Crystal clear water court
  - Forest Green - Lush verdant arena
- **Visual Quality**: Anti-aliasing enabled, DPR 2, smooth ball geometry
- **Visual Effects**:
  - Ball trail with fading particles following the ball
  - Pulsing glow effect on paddles with dynamic lighting
  - Screen flash on scoring (cyan for player, red for AI)
  - Victory confetti celebration when player wins
- **Coin System**: Collect coins during gameplay to unlock skins and maps
- **Progression System**: Earn XP and level up to unlock new content
  - XP earned for winning rounds (base + round bonus + combo bonus)
  - Coins earned for round victories
  - Player level persists across sessions (localStorage)
  - Level requirements for skins (Lvl 2-8) and maps (Lvl 3-10)
  - Stats tracking: games played, wins, highest round, max combo
- **Power-ups**: Various power-ups spawn during rallies (assigned to last ball hitter)
  - Big Paddle (green) - Enlarges your paddle temporarily
  - Slow Ball (orange) - Slows the ball down
  - Speed Boost (pink) - Faster paddle movement
  - Multiball (cyan) - Spawns 2-3 extra balls that can each score
  - Shield (yellow) - Blocks one goal attempt and bounces ball back

## Running the Game
- Start with `npm run dev`
- Game runs on port 5000
- Click "START GAME" to begin
- Desktop: Use W/S or Arrow keys to control your paddle (left side)
- Mobile: Use on-screen touch buttons to move paddle

## Recent Changes
- December 25, 2025: Added achievements system
  - Created useAchievements store with 25+ achievements across 4 categories
  - Achievements menu accessible from main menu
  - Toast notifications when achievements unlock
  - Achievement categories: Gameplay, Progression, Power-ups, Skill
  - XP and coin rewards for unlocking achievements
  - Progress tracking for multi-step achievements
  - Persistent achievement data via localStorage

- December 25, 2025: Added progression and rewards system
  - Created useProgression store with XP, levels, coins, and stats
  - Player earns XP and coins for winning rounds
  - Level requirements for unlocking skins and maps
  - Post-match rewards display showing XP/coins earned
  - Level-up celebration on game over screen
  - Stats displayed in main menu (games, wins, best combo)
  - XP bar and level badge in main menu

- December 25, 2025: Added shield and multiball power-ups
  - Shield power-up blocks one goal and bounces ball back
  - Multiball spawns 2-3 extra scoring balls
  - Visual shield barriers with pulsing glow at goal lines
  - HUD indicators for player/AI shields and multiball count
  - Multiballs clear when main ball scores

- December 25, 2025: Added visual polish and effects
  - Ball trail effect with fading particle spheres
  - Paddle glow/pulse animations using refs for performance
  - Point lights on paddles that pulse with emissive intensity
  - Screen flash overlay on scoring events
  - Victory confetti celebration using react-confetti
  - Power-ups and coins now assigned to whoever hit the ball last

- December 24, 2025: Added customizable stages/maps
  - Created GameMap interface with color configurations
  - Added 5 themed maps (Neon, Midnight, Sunset, Ocean, Forest)
  - Maps unlockable by winning rounds
  - Court dynamically applies selected map colors
  - Maps accessible from main SKINS & MAPS menu with dedicated subsection
  - Smooth visual improvements with anti-aliasing and higher pixel density

- December 24, 2025: Enhanced visual quality
  - Enabled anti-aliasing for smoother edges
  - Increased DPR to 2 for crisper rendering
  - Increased ball sphere detail to 32x32 segments

- December 7, 2025: Added mobile touch controls
  - Created touch control store (useTouchControls.tsx)
  - Added on-screen touch buttons for mobile (TouchControls.tsx)
  - Made HUD responsive for mobile screens
  - Integrated touch input with PlayerPaddle movement

- December 7, 2025: Initial 3D Pong implementation
  - Created game store with score tracking
  - Built 3D court, paddles, and ball components
  - Implemented ball physics with AABB collision detection
  - Added AI opponent that tracks ball position
  - Created HUD with menu, pause, and game over screens
