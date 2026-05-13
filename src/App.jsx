import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [playerPos, setPlayerPos] = useState(50)
  const [ingredients, setIngredients] = useState([])
  const [hazards, setHazards] = useState([])
  const [scoreboard, setScoreboard] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameMessage, setGameMessage] = useState('')
  const [health, setHealth] = useState(3)
  const [gyroProgress, setGyroProgress] = useState(0)

  const ingredientTypes = ['🥩', '🥬', '🧅', '🍅', '🧄']
  const COLLISION_DISTANCE = 8
  const SCORE_PER_INGREDIENT = 10

  // Play sound effects
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      
      if (type === 'collect') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } else if (type === 'hit') {
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } else if (type === 'gameover') {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }
    } catch (e) {
      // Audio context might not be available
    }
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return
      
      if (e.key === 'ArrowLeft') {
        setPlayerPos(prev => Math.max(5, prev - 7))
      } else if (e.key === 'ArrowRight') {
        setPlayerPos(prev => Math.min(95, prev + 7))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver])

  // Drop ingredients and hazards
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const dropInterval = setInterval(() => {
      // Move ingredients down
      setIngredients(prev => {
        const updated = prev
          .map(item => ({ ...item, y: item.y + 4 }))
          .filter(item => item.y < 105)
        return updated
      })

      // Move hazards down
      setHazards(prev => {
        const updated = prev
          .map(item => ({ ...item, y: item.y + 5 }))
          .filter(item => item.y < 105)
        return updated
      })
    }, 50)

    return () => clearInterval(dropInterval)
  }, [gameStarted, gameOver])

  // Spawn ingredients
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        const randomType = ingredientTypes[Math.floor(Math.random() * ingredientTypes.length)]
        setIngredients(prev => [...prev, {
          id: Math.random(),
          x: Math.random() * 85 + 7.5,
          y: -5,
          type: randomType
        }])
      }
    }, 500)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver])

  // Spawn hazards
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setHazards(prev => [...prev, {
          id: Math.random(),
          x: Math.random() * 85 + 7.5,
          y: -5
        }])
      }
    }, 1000)

    return () => clearInterval(spawnInterval)
  }, [gameStarted, gameOver])

  // Collision detection
  useEffect(() => {
    if (!gameStarted || gameOver) return

    // Check ingredient collisions
    ingredients.forEach((ing) => {
      const distance = Math.abs(ing.x - playerPos)
      if (distance < COLLISION_DISTANCE && ing.y > 88) {
        playSound('collect')
        setScore(prev => prev + SCORE_PER_INGREDIENT)
        setGyroProgress(prev => Math.min(4, prev + 1))
        setGameMessage(`${ing.type} COLLECTED!`)
        setTimeout(() => setGameMessage(''), 800)
        setIngredients(prev => prev.filter(i => i.id !== ing.id))
      }
    })

    // Check hazard collisions
    hazards.forEach((haz) => {
      const distance = Math.abs(haz.x - playerPos)
      if (distance < COLLISION_DISTANCE && haz.y > 88) {
        playSound('hit')
        setHealth(prev => {
          const newHealth = prev - 1
          if (newHealth <= 0) {
            endGame()
          }
          return newHealth
        })
        setGameMessage('⚡ HIT BY LIGHTNING! ⚡')
        setTimeout(() => setGameMessage(''), 1000)
        setHazards(prev => prev.filter(h => h.id !== haz.id))
      }
    })
  }, [ingredients, hazards, playerPos, gameStarted, gameOver])

  const endGame = () => {
    setGameOver(true)
    playSound('gameover')
    const newScore = { username, score, date: new Date().toLocaleDateString() }
    setScoreboard([...scoreboard, newScore].sort((a, b) => b.score - a.score).slice(0, 5))
  }

  const handleStartGame = () => {
    if (username.trim()) {
      setGameStarted(true)
      setScore(0)
      setGameOver(false)
      setHealth(3)
      setGyroProgress(0)
      setIngredients([])
      setHazards([])
      setPlayerPos(50)
    }
  }

  const handleRestart = () => {
    setGameStarted(false)
    setUsername('')
    setScore(0)
    setHealth(3)
    setGyroProgress(0)
    setPlayerPos(50)
    setGameMessage('')
    setIngredients([])
    setHazards([])
  }

  if (!gameStarted) {
    return (
      <div className="app">
        <div className="title-screen">
          <h1 className="retro-title">🌯 GYRO BUILDER QUEST 🌯</h1>
          <div className="pixel-art">
            ← CATCH INGREDIENTS →
          </div>
          
          <div className="login-box">
            <label htmlFor="username">ENTER YOUR NAME:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={15}
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
              placeholder="PLAYER"
              className="retro-input"
            />
            <button onClick={handleStartGame} className="retro-button">START GAME</button>
          </div>

          {scoreboard.length > 0 && (
            <div className="scoreboard">
              <h2>HIGH SCORES</h2>
              <table>
                <tbody>
                  {scoreboard.map((entry, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}.</td>
                      <td>{entry.username}</td>
                      <td>{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="app">
        <div className="game-over-screen">
          <h1>GAME OVER!</h1>
          <div className="final-score">
            <p className="score-label">{username.toUpperCase()}</p>
            <p className="score-display">{score}</p>
          </div>
          
          {scoreboard.length > 0 && (
            <div className="final-scoreboard">
              <h2>TOP 5 SCORES</h2>
              <table>
                <tbody>
                  {scoreboard.map((entry, idx) => (
                    <tr key={idx} className={entry.username === username ? 'highlight' : ''}>
                      <td>{idx + 1}.</td>
                      <td>{entry.username}</td>
                      <td>{entry.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <button onClick={handleRestart} className="retro-button">PLAY AGAIN</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="game-container">
        <div className="header">
          <div className="player-name">PLAYER: {username.toUpperCase()}</div>
          <div className="score-display">
            SCORE: {score}
          </div>
          <div className="health-display">
            HEALTH: {'❤️'.repeat(health)}{'🖤'.repeat(3 - health)}
          </div>
        </div>

        {gameMessage && <div className="game-message">{gameMessage}</div>}

        <div className="game-board">
          {/* Ingredients falling */}
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="ingredient"
              style={{
                left: `${ing.x}%`,
                top: `${ing.y}%`
              }}
            >
              {ing.type}
            </div>
          ))}

          {/* Hazards falling */}
          {hazards.map((haz) => (
            <div
              key={haz.id}
              className="hazard"
              style={{
                left: `${haz.x}%`,
                top: `${haz.y}%`
              }}
            >
              ⚡
            </div>
          ))}

          {/* Player */}
          <div
            className="player"
            style={{
              left: `${playerPos}%`
            }}
          >
            🧱
          </div>
        </div>

        <div className="gyro-progress">
          <p>BUILD YOUR GYRO:</p>
          <div className="progress-bar">
            {[...Array(4)].map((_, i) => (
              <span key={i} className={i < gyroProgress ? 'filled' : ''}>
                {i < gyroProgress ? '■' : '□'}
              </span>
            ))}
          </div>
          {gyroProgress === 4 && <p className="complete">✨ GYRO COMPLETE! ✨</p>}
        </div>

        <div className="controls">
          <p>← ARROW KEYS → to move and catch ingredients</p>
          <p>AVOID THE LIGHTNING BOLTS! ⚡</p>
        </div>
      </div>
    </div>
  )
}

export default App
