# Olympus Gyro Quest

A small browser game built with React and Vite. Move the player along the bottom of the board, catch falling gyro ingredients, avoid hazards, and try to finish as many gyros as you can before running out of hearts.

This project is intentionally compact: most of the game logic lives in `src/App.jsx`, with the visual treatment in `src/App.css`.

## Gameplay

- Enter a player name on the title screen.
- Move with the left and right arrow keys, `A` / `D`, or pointer input.
- Catch ingredients to score points and fill the gyro meter.
- Every six ingredients completes a gyro, awards a bonus, restores a heart, and briefly turns on Sauce mode.
- Avoid hazards:
  - lightning damages you
  - rogue sandals damage you
  - Dad Tax receipts remove 30% of your current score
- Collect powerups:
  - Athena Wisdom increases scoring
  - Hermes Drift makes movement faster
  - Nectar restores a heart

High scores are saved in `localStorage`, so they persist between runs in the same browser.

## Run Locally

```bash
npm install
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173/`.

For a production build:

```bash
npm run build
```

## Project Structure

```text
src/
  App.jsx       Main game component and game loop
  App.css       Layout, board styling, animations, and responsive styles
  main.jsx      React entry point
  index.css     Global page styles
```

## Implementation Notes

The game loop uses `requestAnimationFrame`. React state drives rendering, while refs keep the animation loop reading current values for score, health, boosts, items, and player position without running into stale closures.

Falling items are generated from three small data sets: ingredients, hazards, and powerups. The loop updates item positions, checks collision against the player, updates particles, and schedules the next frame while the game is in the `playing` phase.

Sound effects are generated with the Web Audio API instead of external audio files.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # build the app
npm run lint     # run ESLint
npm run preview  # preview the production build
```
