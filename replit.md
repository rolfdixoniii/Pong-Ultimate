# 3D Pong Game

## Overview
A 3D version of the classic Pong game built with React Three Fiber. Features single-player gameplay against an AI opponent with keyboard controls.

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
        Court.tsx       - 3D court/playing field
        GameScene.tsx   - Main game scene with ball, paddles, physics
        GameHUD.tsx     - Score display, menus, game controls
        SoundManager.tsx - Audio initialization
      ui/               - Reusable UI components
    lib/
      stores/
        usePong.tsx     - Game state (scores, phase, winner)
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

## Running the Game
- Start with `npm run dev`
- Game runs on port 5000
- Click "START GAME" to begin
- Desktop: Use W/S or Arrow keys to control your paddle (left side)
- Mobile: Use on-screen touch buttons to move paddle

## Recent Changes
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
