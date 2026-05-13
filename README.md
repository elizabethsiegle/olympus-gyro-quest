# ⚡ OLYMPUS GYRO QUEST ⚡

An 8-bit retro arcade game featuring LEGO Zeus collecting gyros with mythological power-ups!

## 🎮 Game Features

### Core Gameplay
Build a gyro by collecting gyro ingredients (moving your character with the left and right arrows) and avoiding Zeus's lightning bolts

### Scoreboard & Username Tracking
- **Username Entry** - Enter your mortal name before the quest begins
- **High Scores** - View top 5 scores on the title screen
- **Score Persistence** - Your scores are tracked throughout your gaming session
- **Game Over Screen** - Shows final score with highlighted personal record

## 🎨 Retro 8-Bit Aesthetic
- **Press Start 2P Font** - Classic arcade-style typography
- **Neon Colors** - Yellow (#FFD60A), Red (#E63946), Blue (#457B9D), Cyan (#4ECDC4)
- **Glowing Effects** - Text shadows and drop shadows for that authentic arcade feel
- **LEGO-themed Platforms** - Yellow and white striped design
- **Pixel-perfect Animations** - Bouncing titles, spinning characters, floating power-ups

## 🎵 Audio
- **Retro Sound Effects** - Generated using Web Audio API:
  - ✨ Gyro collect sound
  - ⚔️ Power-up activation
  - 🔥 Apollo Mode activation
  - 💥 Game Over buzzer

## 🕹️ How to Play

1. **Start Screen**: Enter your player name (up to 15 characters)
2. **Main Game**:
   - Use **← → Arrow Keys** to move LEGO Zeus left and right
   - Catch falling gyros (🌀) to earn **10 points** each
3. **Special Features**:
   - Click **"Dad Tax (-30%)"** button to experience parental taxation at 30% of your current score
   - Click **"End Game"** to finish your quest
4. **Game Over**: View your final score and top 5 high scores table
5. **Play Again**: Return to title screen to challenge yourself again

## 🚀 Running the Game

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The game will be available at `http://localhost:5173/`

## 🛠️ Technologies Used

- **React 19** - UI framework
- **Vite** - Lightning-fast build tool
- **CSS3** - Animations and styling
- **Web Audio API** - Retro sound effects

## 📝 Project Structure

```
src/
├── App.jsx       - Main game component with all game logic
├── App.css       - Retro 8-bit styling and animations
├── main.jsx      - React entry point
└── index.css     - Global styles
```

## 🎯 Game Mechanics

### Scoring
- **Normal Mode**: 10 points per gyro
- **Athena Mode** (2x multiplier): 20 points per gyro
- **Apollo Mode**: 50 points per gyro
- **Apollo Mode Activation**: Automatic at 200 points

### Collision Detection
- Gyros and power-ups are detected when Zeus gets within 8% of screen width
- Items disappear when caught and new ones spawn
- Uncaught items disappear at the bottom

### Power-Up Mechanics
- **Athena Power-Up**: Lasts 8 seconds, active shown in score display with "x2!"
- **Apollo Mode**: Lasts 10 seconds, triggered at 200+ points, shown with "🔥APOLLO!🔥"

## 🎪 Easter Eggs
- **Dad Tax**: Hidden feature "allegedly added by the kids" - steal 30% of player points
- **Multiplier Display**: Changes color and glows when modes are active
- **Game Messages**: Funny pop-up messages for all special events

## 🌟 Features to Explore
- Try to beat the high score!
- See how high you can get your score with Apollo Mode
- Get your friends' names on the scoreboard
- Screenshot your high score (or your Dad Tax moment!)

## 📱 Responsive Design
Game scales beautifully on different screen sizes while maintaining the retro aesthetic.

---

**Made with ⚡ and 🧱 for maximum mythological arcade fun!**
