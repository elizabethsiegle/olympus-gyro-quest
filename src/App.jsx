import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const SCOREBOARD_KEY = 'olympus-gyro-scores-v3'
const MAX_HEALTH = 3
const PLAYER_MIN = 6
const PLAYER_MAX = 94
const PLAYER_Y = 87
const RECIPE_SIZE = 6

const ingredients = [
  { icon: '🥩', name: 'ambrosia lamb', points: 12 },
  { icon: '🥬', name: 'hero lettuce', points: 9 },
  { icon: '🧅', name: 'onion of prophecy', points: 10 },
  { icon: '🍅', name: 'oracle tomato', points: 10 },
  { icon: '🧄', name: 'garlic thunder', points: 11 },
  { icon: '🥙', name: 'pita portal', points: 14 },
  { icon: '🍟', name: 'fries from the underworld', points: 13 },
]

const hazards = [
  {
    icon: '⚡',
    name: 'lightning',
    effect: 'damage',
    messages: ['ZEUS MISCLICKED', 'LIGHTNING IS NOT A CONDIMENT', 'OLYMPUS OSHA NOTIFIED'],
  },
  {
    icon: '🧾',
    name: 'dad tax',
    effect: 'tax',
    messages: ['DAD TAX COLLECTED', 'ITEMIZED DEDUCTIONS: YOUR DREAMS', 'RECEIPT? ABSOLUTELY NOT'],
  },
  {
    icon: '🩴',
    name: 'rogue sandal',
    effect: 'bonk',
    messages: ['SANDAL FROM ORBIT', 'HERA SAID NO RUNNING', 'A VERY FORMAL BONK'],
  },
]

const powerups = [
  {
    icon: '🦉',
    name: 'Athena Wisdom',
    boost: 'athena',
    duration: 7600,
    messages: ['ATHENA APPROVES THIS SNACK', 'WISDOM SAUCE: X2', 'BIG BRAIN GYRO MODE'],
  },
  {
    icon: '🪽',
    name: 'Hermes Drift',
    boost: 'hermes',
    duration: 6600,
    messages: ['HERMES PUT WHEELS ON THE PITA', 'SIDEWAYS BUT CLASSY', 'DRIFT LICENSE ACQUIRED'],
  },
  {
    icon: '🍯',
    name: 'Nectar Refill',
    boost: 'nectar',
    duration: 0,
    messages: ['NECTAR TOP-UP', 'HEALTHY? LEGALLY UNCLEAR', 'IMMORTALITY BUT STICKY'],
  },
]

const catchMessages = [
  'PITA PLATFORMING',
  'GYRO ARCHITECTURE',
  'TZATZIKI TRAJECTORY',
  'THE LAMB HAS LANDED',
  'SNACK PROPHECY FULFILLED',
  'A VERY SERIOUS SALAD MOVE',
]

const comboMessages = [
  'COMBO SO HOT HEPHAESTUS ASKED FOR NOTES',
  'OLYMPUS FOOD TRUCK SPEEDRUN',
  'NO CRUMBS. ONLY LEGEND.',
  'THE GODS ARE AUDIBLY CHEWING',
]

const gameOverMessages = [
  'THE GYRO HAS LEFT THE MYTHOLOGY',
  'ZEUS DEMANDS A REMATCH',
  'YOU WERE BRAVE, CRUNCHY, AND BRIEFLY SAUCED',
  'HADES SAVED YOU A TABLE',
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const choose = (list) => list[Math.floor(Math.random() * list.length)]
const formatName = (name) => (name.trim() || 'MORTAL').slice(0, 15).toUpperCase()

function loadScores() {
  try {
    const saved = window.localStorage.getItem(SCOREBOARD_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.slice(0, 7) : []
  } catch {
    return []
  }
}

function createItem(kind, difficulty = 1) {
  const source = kind === 'ingredient' ? choose(ingredients) : kind === 'hazard' ? choose(hazards) : choose(powerups)
  const baseSpeed = kind === 'ingredient' ? 27 : kind === 'hazard' ? 31 : 25

  return {
    id: `${kind}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`,
    kind,
    x: Math.random() * 82 + 9,
    y: -8,
    wobble: Math.random() * 16 - 8,
    drift: Math.random() * 8 - 4,
    speed: (baseSpeed + Math.random() * 8) * difficulty,
    born: performance.now(),
    ...source,
  }
}

function App() {
  const [username, setUsername] = useState('')
  const [phase, setPhase] = useState('title')
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(MAX_HEALTH)
  const [playerX, setPlayerX] = useState(50)
  const [items, setItems] = useState([])
  const [gyroParts, setGyroParts] = useState(0)
  const [completedGyros, setCompletedGyros] = useState(0)
  const [combo, setCombo] = useState(0)
  const [message, setMessage] = useState(null)
  const [boosts, setBoosts] = useState({ athena: 0, hermes: 0, sauce: 0 })
  const [particles, setParticles] = useState([])
  const [scoreboard, setScoreboard] = useState(loadScores)
  const [lastRun, setLastRun] = useState(null)
  const [isShaking, setIsShaking] = useState(false)

  const boardRef = useRef(null)
  const audioRef = useRef(null)
  const animationRef = useRef(null)
  const messageTimerRef = useRef(null)
  const shakeTimerRef = useRef(null)
  const keysRef = useRef({ left: false, right: false })
  const pointerTargetRef = useRef(null)
  const playerXRef = useRef(50)
  const scoreRef = useRef(0)
  const healthRef = useRef(MAX_HEALTH)
  const comboRef = useRef(0)
  const itemsRef = useRef([])
  const boostsRef = useRef({ athena: 0, hermes: 0, sauce: 0 })
  const gyroPartsRef = useRef(0)
  const completedGyrosRef = useRef(0)
  const phaseRef = useRef('title')
  const usernameRef = useRef('')
  const spawnRef = useRef({ ingredient: 0, hazard: 0.9, powerup: 3.2 })

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    usernameRef.current = username
  }, [username])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    healthRef.current = health
  }, [health])

  useEffect(() => {
    comboRef.current = combo
  }, [combo])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    boostsRef.current = boosts
  }, [boosts])

  useEffect(() => {
    gyroPartsRef.current = gyroParts
  }, [gyroParts])

  useEffect(() => {
    completedGyrosRef.current = completedGyros
  }, [completedGyros])

  useEffect(() => {
    try {
      window.localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(scoreboard))
    } catch {
      // Local storage can be disabled in private browsing.
    }
  }, [scoreboard])

  useEffect(() => {
    return () => {
      window.clearTimeout(messageTimerRef.current)
      window.clearTimeout(shakeTimerRef.current)
      window.cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const activeBoosts = useMemo(() => {
    return Object.entries(boosts)
      .filter(([, end]) => end > 0)
      .map(([boost]) => boost)
  }, [boosts])

  const recipeSlots = useMemo(() => Array.from({ length: RECIPE_SIZE }, (_, index) => index), [])

  const playSound = useCallback((type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      const ctx = audioRef.current || new AudioContext()
      audioRef.current = ctx

      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)

      const now = ctx.currentTime
      const patterns = {
        collect: { start: 620, end: 920, duration: 0.12, wave: 'square', gain: 0.08 },
        power: { start: 440, end: 1040, duration: 0.24, wave: 'triangle', gain: 0.1 },
        hit: { start: 160, end: 80, duration: 0.22, wave: 'sawtooth', gain: 0.12 },
        complete: { start: 720, end: 1320, duration: 0.32, wave: 'square', gain: 0.1 },
        gameover: { start: 220, end: 70, duration: 0.42, wave: 'triangle', gain: 0.12 },
        button: { start: 520, end: 360, duration: 0.08, wave: 'square', gain: 0.06 },
      }
      const pattern = patterns[type] || patterns.collect

      oscillator.type = pattern.wave
      oscillator.frequency.setValueAtTime(pattern.start, now)
      oscillator.frequency.exponentialRampToValueAtTime(pattern.end, now + pattern.duration)
      gain.gain.setValueAtTime(pattern.gain, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + pattern.duration)
      oscillator.start(now)
      oscillator.stop(now + pattern.duration)
    } catch {
      // Audio is decorative; the game should keep moving without it.
    }
  }, [])

  const flashMessage = useCallback((text, tone = 'good', duration = 1100) => {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
    window.clearTimeout(messageTimerRef.current)
    setMessage({ id, text, tone })
    messageTimerRef.current = window.setTimeout(() => {
      setMessage((current) => (current?.id === id ? null : current))
    }, duration)
  }, [])

  const triggerShake = useCallback(() => {
    window.clearTimeout(shakeTimerRef.current)
    setIsShaking(true)
    shakeTimerRef.current = window.setTimeout(() => setIsShaking(false), 260)
  }, [])

  const addParticles = useCallback((item, tone = 'good') => {
    const burst = Array.from({ length: tone === 'bad' ? 9 : 7 }, (_, index) => ({
      id: `${item.id}-spark-${index}`,
      x: item.x,
      y: item.y,
      vx: Math.random() * 22 - 11,
      vy: Math.random() * -18 - 7,
      age: 0,
      ttl: 0.42 + Math.random() * 0.25,
      icon: tone === 'bad' ? '✹' : index % 2 ? '✦' : item.icon,
      tone,
    }))
    setParticles((current) => [...current.slice(-28), ...burst])
  }, [])

  const finishGame = useCallback((reason = choose(gameOverMessages)) => {
    if (phaseRef.current !== 'playing') return

    phaseRef.current = 'gameover'
    setPhase('gameover')
    playSound('gameover')
    window.cancelAnimationFrame(animationRef.current)

    const entry = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      username: formatName(usernameRef.current),
      score: scoreRef.current,
      gyros: completedGyrosRef.current,
      date: new Date().toLocaleDateString(),
    }

    setLastRun({ ...entry, reason })
    setScoreboard((current) => [...current, entry].sort((a, b) => b.score - a.score).slice(0, 7))
  }, [playSound])

  const resetRun = useCallback(() => {
    const nextBoosts = { athena: 0, hermes: 0, sauce: 0 }
    playerXRef.current = 50
    scoreRef.current = 0
    healthRef.current = MAX_HEALTH
    comboRef.current = 0
    itemsRef.current = []
    boostsRef.current = nextBoosts
    gyroPartsRef.current = 0
    completedGyrosRef.current = 0
    spawnRef.current = { ingredient: 0, hazard: 0.9, powerup: 3.2 }
    pointerTargetRef.current = null
    keysRef.current = { left: false, right: false }

    setScore(0)
    setHealth(MAX_HEALTH)
    setPlayerX(50)
    setItems([])
    setGyroParts(0)
    setCompletedGyros(0)
    setCombo(0)
    setBoosts(nextBoosts)
    setParticles([])
    setMessage(null)
    setIsShaking(false)
  }, [])

  const handleStartGame = useCallback(() => {
    const nextName = formatName(username)
    setUsername(nextName)
    usernameRef.current = nextName
    resetRun()
    setLastRun(null)
    setPhase('playing')
    phaseRef.current = 'playing'
    playSound('button')
    flashMessage('BUILD FAST. SAUCE WITH HONOR.', 'good', 1400)
  }, [flashMessage, playSound, resetRun, username])

  const handleRestart = useCallback(() => {
    resetRun()
    setPhase('title')
    phaseRef.current = 'title'
    playSound('button')
  }, [playSound, resetRun])

  const applyDadTax = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    const tax = Math.max(1, Math.ceil(scoreRef.current * 0.3))
    scoreRef.current = Math.max(0, scoreRef.current - tax)
    comboRef.current = 0
    setScore(scoreRef.current)
    setCombo(0)
    playSound('hit')
    triggerShake()
    flashMessage(`DAD TAX VOLUNTARILY STOLEN: -${tax}`, 'bad', 1300)
  }, [flashMessage, playSound, triggerShake])

  const updatePointerTarget = useCallback((event) => {
    if (phaseRef.current !== 'playing' || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    pointerTargetRef.current = clamp(((event.clientX - rect.left) / rect.width) * 100, PLAYER_MIN, PLAYER_MAX)
  }, [])

  const clearPointerTarget = useCallback(() => {
    pointerTargetRef.current = null
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keysRef.current.left = true
        event.preventDefault()
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keysRef.current.right = true
        event.preventDefault()
      }
    }

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        keysRef.current.left = false
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        keysRef.current.right = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    let lastTime = performance.now()

    const awardIngredient = (item, now) => {
      const athenaActive = boostsRef.current.athena > now
      const sauceActive = boostsRef.current.sauce > now
      const multiplier = (athenaActive ? 2 : 1) + (sauceActive ? 1 : 0)
      const nextCombo = comboRef.current + 1
      const comboBonus = Math.min(20, Math.floor(nextCombo / 4) * 4)
      const points = (item.points + comboBonus) * multiplier

      comboRef.current = nextCombo
      scoreRef.current += points
      setCombo(nextCombo)
      setScore(scoreRef.current)
      playSound('collect')
      addParticles(item)

      const nextParts = gyroPartsRef.current + 1
      if (nextParts >= RECIPE_SIZE) {
        const gyroBonus = 80 * multiplier + nextCombo * 2
        scoreRef.current += gyroBonus
        gyroPartsRef.current = 0
        completedGyrosRef.current += 1
        boostsRef.current = { ...boostsRef.current, sauce: now + 5200 }
        setScore(scoreRef.current)
        setGyroParts(0)
        setCompletedGyros(completedGyrosRef.current)
        setBoosts(boostsRef.current)
        setHealth((current) => {
          const restored = Math.min(MAX_HEALTH, current + 1)
          healthRef.current = restored
          return restored
        })
        playSound('complete')
        flashMessage(`GYRO COMPLETE +${gyroBonus}. SAUCE CHAOS.`, 'power', 1500)
        return
      }

      gyroPartsRef.current = nextParts
      setGyroParts(nextParts)

      if (nextCombo > 0 && nextCombo % 8 === 0) {
        flashMessage(choose(comboMessages), 'power', 1300)
      } else {
        flashMessage(`${choose(catchMessages)} +${points}`, 'good', 900)
      }
    }

    const hitHazard = (item) => {
      addParticles(item, 'bad')
      triggerShake()
      playSound('hit')
      comboRef.current = 0
      setCombo(0)

      if (item.effect === 'tax') {
        const tax = Math.max(1, Math.ceil(scoreRef.current * 0.3))
        scoreRef.current = Math.max(0, scoreRef.current - tax)
        setScore(scoreRef.current)
        flashMessage(`${choose(item.messages)} -${tax}`, 'bad', 1250)
        return
      }

      const damage = item.effect === 'bonk' ? 1 : 1
      healthRef.current -= damage
      setHealth(Math.max(0, healthRef.current))
      flashMessage(choose(item.messages), 'bad', 1250)

      if (healthRef.current <= 0) {
        finishGame(choose(gameOverMessages))
      }
    }

    const collectPowerup = (item, now) => {
      addParticles(item, 'power')
      playSound('power')

      if (item.boost === 'nectar') {
        healthRef.current = Math.min(MAX_HEALTH, healthRef.current + 1)
        setHealth(healthRef.current)
      } else {
        boostsRef.current = { ...boostsRef.current, [item.boost]: now + item.duration }
        setBoosts(boostsRef.current)
      }

      flashMessage(choose(item.messages), 'power', 1300)
    }

    const step = (now) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000)
      lastTime = now

      const expiredBoosts = Object.fromEntries(
        Object.entries(boostsRef.current).map(([boost, end]) => [boost, end > now ? end : 0]),
      )
      if (JSON.stringify(expiredBoosts) !== JSON.stringify(boostsRef.current)) {
        boostsRef.current = expiredBoosts
        setBoosts(expiredBoosts)
      }

      const difficulty = 1 + Math.min(1.25, scoreRef.current / 900)
      const hermesActive = boostsRef.current.hermes > now
      const playerSpeed = hermesActive ? 82 : 58
      const direction = Number(keysRef.current.right) - Number(keysRef.current.left)
      let nextPlayerX = playerXRef.current

      if (direction !== 0) {
        nextPlayerX += direction * playerSpeed * dt
        pointerTargetRef.current = null
      } else if (pointerTargetRef.current !== null) {
        const delta = pointerTargetRef.current - nextPlayerX
        const maxStep = playerSpeed * 1.35 * dt
        nextPlayerX += clamp(delta, -maxStep, maxStep)
      }

      nextPlayerX = clamp(nextPlayerX, PLAYER_MIN, PLAYER_MAX)
      if (Math.abs(nextPlayerX - playerXRef.current) > 0.02) {
        playerXRef.current = nextPlayerX
        setPlayerX(nextPlayerX)
      }

      const spawns = spawnRef.current
      spawns.ingredient -= dt
      spawns.hazard -= dt
      spawns.powerup -= dt

      const nextItems = [...itemsRef.current]
      if (spawns.ingredient <= 0) {
        nextItems.push(createItem('ingredient', difficulty))
        spawns.ingredient = Math.max(0.28, 0.62 - difficulty * 0.09 + Math.random() * 0.16)
      }
      if (spawns.hazard <= 0) {
        nextItems.push(createItem('hazard', difficulty))
        spawns.hazard = Math.max(0.66, 1.38 - difficulty * 0.14 + Math.random() * 0.62)
      }
      if (spawns.powerup <= 0) {
        nextItems.push(createItem('powerup', 0.95))
        spawns.powerup = 5.6 + Math.random() * 4.4
      }

      const survivors = []
      for (const item of nextItems) {
        const wobble = Math.sin((now - item.born) / 360) * item.wobble * dt
        const moved = {
          ...item,
          x: clamp(item.x + item.drift * dt + wobble, 5, 95),
          y: item.y + item.speed * dt,
        }

        const dx = Math.abs(moved.x - playerXRef.current)
        const dy = Math.abs(moved.y - PLAYER_Y)
        const hitRadius = moved.kind === 'hazard' ? 7.2 : 8.1
        const caught = dx * 0.85 + dy * 0.55 < hitRadius

        if (caught) {
          if (moved.kind === 'ingredient') awardIngredient(moved, now)
          if (moved.kind === 'hazard') hitHazard(moved)
          if (moved.kind === 'powerup') collectPowerup(moved, now)
        } else if (moved.y < 108) {
          survivors.push(moved)
        } else if (moved.kind === 'ingredient' && comboRef.current > 0) {
          comboRef.current = 0
          setCombo(0)
        }
      }

      itemsRef.current = survivors
      setItems(survivors)

      setParticles((current) =>
        current
          .map((particle) => ({
            ...particle,
            age: particle.age + dt,
            x: particle.x + particle.vx * dt,
            y: particle.y + particle.vy * dt,
            vy: particle.vy + 38 * dt,
          }))
          .filter((particle) => particle.age < particle.ttl),
      )

      if (phaseRef.current === 'playing') {
        animationRef.current = window.requestAnimationFrame(step)
      }
    }

    animationRef.current = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationRef.current)
  }, [addParticles, finishGame, flashMessage, phase, playSound, triggerShake])

  const titleScores = scoreboard.slice(0, 5)
  const playerLabel = formatName(username)

  if (phase === 'title') {
    return (
      <main className="app">
        <section className="title-screen" aria-label="Olympus Gyro Quest">
          <div className="title-art" aria-hidden="true">
            <span>⚡</span>
            <span>🥙</span>
            <span>🏛️</span>
          </div>
          <h1>Olympus Gyro Quest</h1>
          <p className="title-copy">Catch the feast. Dodge the paperwork. Impress nobody responsibly.</p>

          <form
            className="start-panel"
            onSubmit={(event) => {
              event.preventDefault()
              handleStartGame()
            }}
          >
            <label htmlFor="username">Mortal Name</label>
            <div className="start-row">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value.toUpperCase())}
                maxLength={15}
                placeholder="MORTAL"
                autoComplete="off"
              />
              <button type="submit">Start</button>
            </div>
          </form>

          {titleScores.length > 0 && (
            <section className="scores-panel" aria-label="High scores">
              <h2>High Scores</h2>
              <ol>
                {titleScores.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.username}</span>
                    <strong>{entry.score}</strong>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </section>
      </main>
    )
  }

  if (phase === 'gameover') {
    return (
      <main className="app">
        <section className="game-over-screen" aria-label="Game over">
          <p className="kicker">{lastRun?.reason || 'THE GYRO HAS LEFT THE MYTHOLOGY'}</p>
          <h1>Game Over</h1>
          <div className="final-score">
            <span>{lastRun?.username || playerLabel}</span>
            <strong>{score}</strong>
            <small>{completedGyros} completed gyros</small>
          </div>

          {scoreboard.length > 0 && (
            <section className="scores-panel final" aria-label="Final high scores">
              <h2>Top Scores</h2>
              <ol>
                {scoreboard.slice(0, 5).map((entry) => (
                  <li key={entry.id} className={entry.id === lastRun?.id ? 'highlight' : ''}>
                    <span>{entry.username}</span>
                    <strong>{entry.score}</strong>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="game-over-actions">
            <button onClick={handleStartGame}>Again</button>
            <button className="secondary" onClick={handleRestart}>
              Title
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className={`game-container ${isShaking ? 'shake' : ''}`} aria-label="Gyro game">
        <header className="hud">
          <div>
            <span className="hud-label">Mortal</span>
            <strong>{playerLabel}</strong>
          </div>
          <div>
            <span className="hud-label">Score</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span className="hud-label">Combo</span>
            <strong>{combo > 0 ? `${combo}x` : '0x'}</strong>
          </div>
          <div>
            <span className="hud-label">Hearts</span>
            <strong className="health">{'♥'.repeat(health)}{'♡'.repeat(MAX_HEALTH - health)}</strong>
          </div>
        </header>

        <div
          ref={boardRef}
          className="game-board"
          onPointerDown={updatePointerTarget}
          onPointerMove={updatePointerTarget}
          onPointerLeave={clearPointerTarget}
          onPointerUp={clearPointerTarget}
        >
          <div className="olympus-lanes" aria-hidden="true" />

          {items.map((item) => (
            <div
              key={item.id}
              className={`falling-item ${item.kind}`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                '--spin': `${item.wobble * 6}deg`,
              }}
              aria-label={item.name}
            >
              <span>{item.icon}</span>
            </div>
          ))}

          {particles.map((particle) => (
            <span
              key={particle.id}
              className={`particle ${particle.tone}`}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                opacity: Math.max(0, 1 - particle.age / particle.ttl),
              }}
              aria-hidden="true"
            >
              {particle.icon}
            </span>
          ))}

          <div className="player-shadow" style={{ left: `${playerX}%` }} aria-hidden="true" />
          <div className="player" style={{ left: `${playerX}%` }} aria-label="player">
            <span className="player-cape">▰</span>
            <span className="player-face">🧱</span>
            <span className="player-gyro">🥙</span>
          </div>

          {message && <div className={`game-message ${message.tone}`}>{message.text}</div>}
        </div>

        <footer className="run-panel">
          <div className="recipe-meter" aria-label="Gyro progress">
            {recipeSlots.map((slot) => (
              <span key={slot} className={slot < gyroParts ? 'filled' : ''} />
            ))}
          </div>

          <div className="boost-strip" aria-label="Active boosts">
            <span className={activeBoosts.includes('athena') ? 'active' : ''}>🦉 Wisdom</span>
            <span className={activeBoosts.includes('hermes') ? 'active' : ''}>🪽 Drift</span>
            <span className={activeBoosts.includes('sauce') ? 'active' : ''}>🥫 Sauce</span>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="tax-button"
              onClick={applyDadTax}
              aria-label="Dad Tax: subtract 30 percent of your score"
              title="Dad Tax: -30% score"
            >
              🧾 Dad Tax -30%
            </button>
            <button type="button" className="secondary" onClick={() => finishGame('YOU RETIRED WITH DIGNITY-ish')}>
              End Run
            </button>
          </div>
        </footer>
      </section>
    </main>
  )
}

export default App
