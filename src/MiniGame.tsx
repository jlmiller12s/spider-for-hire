import { useCallback, useEffect, useRef, useState } from 'react'
import './game.css'

type FightPhase = 'ready' | 'playing' | 'won' | 'lost'
type Move = 'punch' | 'kick'

type MiniGameProps = {
  onExit: () => void
}

function Fighter({ side, action, position }: { side: 'hero' | 'villain'; action: string; position: number }) {
  return (
    <div className={`fighter fighter-${side} ${action}`} style={{ left: `${position}%` }} aria-hidden="true">
      <span className="fighter-shadow" />
      <span className="fighter-leg back"><i className="thigh" /><i className="shin" /><i className="boot" /></span>
      <span className="fighter-leg front"><i className="thigh" /><i className="shin" /><i className="boot" /></span>
      <span className="fighter-body"><i className="chest-mark" /></span>
      <span className="fighter-neck" />
      <span className="fighter-head"><i className="eye left" /><i className="eye right" /><b className="mask-lines" /><em className="villain-grin" /></span>
      <span className="fighter-arm back"><i className="upper-arm" /><i className="forearm" /><i className="fist" /></span>
      <span className="fighter-arm front"><i className="upper-arm" /><i className="forearm" /><i className="fist" /></span>
    </div>
  )
}

export default function MiniGame({ onExit }: MiniGameProps) {
  const [phase, setPhase] = useState<FightPhase>('ready')
  const [heroHealth, setHeroHealth] = useState(100)
  const [villainHealth, setVillainHealth] = useState(100)
  const [lives, setLives] = useState(2)
  const [message, setMessage] = useState('A TROUBLEMAKER IS WRECKING THE BLOCK!')
  const [heroAction, setHeroAction] = useState('idle')
  const [villainAction, setVillainAction] = useState('idle')
  const [heroPosition, setHeroPosition] = useState(22)
  const [villainPosition, setVillainPosition] = useState(78)
  const [isJumping, setIsJumping] = useState(false)
  const [comboMove, setComboMove] = useState<Move>('punch')
  const livesRef = useRef(2)
  const heroPositionRef = useRef(22)
  const villainPositionRef = useRef(78)
  const jumpingRef = useRef(false)
  const attackLocked = useRef(false)
  const timers = useRef<number[]>([])

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay)
    timers.current.push(timer)
  }, [])

  const resetFight = useCallback(() => {
    livesRef.current = 2
    setLives(2)
    setHeroHealth(100)
    setVillainHealth(100)
    heroPositionRef.current = 22
    villainPositionRef.current = 78
    jumpingRef.current = false
    setHeroPosition(22)
    setVillainPosition(78)
    setIsJumping(false)
    setHeroAction('idle')
    setVillainAction('idle')
    setMessage('FIGHT!')
    setPhase('playing')
  }, [])

  const enemyAttack = useCallback(() => {
    if (attackLocked.current) return
    const distance = villainPositionRef.current - heroPositionRef.current

    if (distance > 23) {
      const nextPosition = Math.max(heroPositionRef.current + 10, villainPositionRef.current - 6)
      villainPositionRef.current = nextPosition
      setVillainPosition(nextPosition)
      setVillainAction('advancing')
      setMessage('THE MENACE MOVES CLOSER...')
      later(() => setVillainAction('idle'), 360)
      return
    }

    if (jumpingRef.current) {
      setVillainAction('attacking')
      setMessage('JUMP DODGE! THE VILLAIN MISSES!')
      later(() => setVillainAction('idle'), 330)
      return
    }

    const damage = 7 + Math.floor(Math.random() * 6)
    setVillainAction('attacking')
    setHeroAction('hit')
    setMessage(`THE VILLAIN HITS BACK!  -${damage}`)

    setHeroHealth((current) => {
      const next = Math.max(0, current - damage)
      if (next > 0) return next

      if (livesRef.current > 1) {
        livesRef.current -= 1
        setLives(livesRef.current)
        heroPositionRef.current = 22
        villainPositionRef.current = 78
        setHeroPosition(22)
        setVillainPosition(78)
        setMessage('LIFE LOST — BACK INTO THE FIGHT!')
        return 100
      }

      livesRef.current = 0
      setLives(0)
      setMessage('THE CITY WILL NEED A REMATCH...')
      setPhase('lost')
      return 0
    })

    later(() => {
      setVillainAction('idle')
      setHeroAction('idle')
    }, 330)
  }, [later])

  const attack = useCallback((move: Move) => {
    if (phase !== 'playing' || attackLocked.current) return
    attackLocked.current = true
    const inRange = villainPositionRef.current - heroPositionRef.current <= 23
    const airborne = jumpingRef.current
    const damage = (move === 'kick' ? 10 : 7) + (airborne ? 2 : 0)
    setHeroAction(airborne ? `jump-${move === 'kick' ? 'kicking' : 'punching'}` : move === 'kick' ? 'kicking' : 'punching')

    if (!inRange) {
      setMessage(`${move.toUpperCase()} WHIFFS — MOVE CLOSER!`)
      later(() => {
        attackLocked.current = false
        setHeroAction(jumpingRef.current ? 'jumping' : 'idle')
      }, 310)
      return
    }

    setVillainAction('hit')
    setMessage(`${airborne ? 'JUMP ' : ''}${move.toUpperCase()}!  -${damage}`)

    setVillainHealth((current) => {
      const next = Math.max(0, current - damage)
      if (next === 0) {
        setMessage('NEIGHBORHOOD SAVED!')
        setPhase('won')
        setHeroAction('victory')
        setVillainAction('defeated')
      }
      return next
    })

    later(() => {
      attackLocked.current = false
      setHeroAction((current) => current === 'victory' ? current : jumpingRef.current ? 'jumping' : 'idle')
      setVillainAction((current) => current === 'defeated' ? current : 'idle')
    }, 310)
  }, [later, phase])

  const moveHero = useCallback((direction: -1 | 1) => {
    if (phase !== 'playing' || attackLocked.current || jumpingRef.current) return
    const nextPosition = Math.max(9, Math.min(villainPositionRef.current - 9, heroPositionRef.current + direction * 7))
    heroPositionRef.current = nextPosition
    setHeroPosition(nextPosition)
    setHeroAction(direction > 0 ? 'advancing' : 'retreating')
    setMessage(direction > 0 ? 'CLOSING THE DISTANCE...' : 'CREATING SOME SPACE...')
    later(() => setHeroAction('idle'), 260)
  }, [later, phase])

  const jump = useCallback(() => {
    if (phase !== 'playing' || jumpingRef.current) return
    jumpingRef.current = true
    setIsJumping(true)
    setHeroAction('jumping')
    setMessage('AIRBORNE! ATTACK NOW!')
    later(() => {
      jumpingRef.current = false
      setIsJumping(false)
      setHeroAction((current) => current === 'victory' ? current : 'idle')
    }, 760)
  }, [later, phase])

  const arenaAttack = () => {
    attack(comboMove)
    setComboMove((current) => current === 'punch' ? 'kick' : 'punch')
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const interval = window.setInterval(enemyAttack, 1350)
    return () => window.clearInterval(interval)
  }, [enemyAttack, phase])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onExit()
      if (event.key.toLowerCase() === 'a') attack('punch')
      if (event.key.toLowerCase() === 's') attack('kick')
      if (event.key === 'ArrowLeft') moveHero(-1)
      if (event.key === 'ArrowRight') moveHero(1)
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') jump()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [attack, jump, moveHero, onExit])

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  return (
    <div className="fight-overlay" role="dialog" aria-modal="true" aria-label="Neighborhood Brawl mini game">
      <div className="fight-scanlines" aria-hidden="true" />
      <header className="fight-header">
        <div className="fight-logo"><span>SPIDER</span><strong>NEIGHBORHOOD BRAWL</strong></div>
        <button className="fight-close" onClick={onExit} aria-label="Exit mini game">EXIT ×</button>
      </header>

      <main className="fight-console">
        <section className="fight-hud" aria-label="Fight status">
          <div className="health-card hero-health">
            <div><strong>SPIDER HERO</strong><span>{heroHealth} HP</span></div>
            <div className="health-track"><span style={{ width: `${heroHealth}%` }} /></div>
            <div className="lives" aria-label={`${lives} lives remaining`}>
              LIVES {Array.from({ length: 2 }, (_, index) => <i className={index < lives ? 'active' : ''} key={index}>♥</i>)}
            </div>
          </div>
          <div className="fight-round">ROUND<br /><strong>01</strong></div>
          <div className="health-card villain-health">
            <div><strong>THE MENACE</strong><span>{villainHealth} HP</span></div>
            <div className="health-track"><span style={{ width: `${villainHealth}%` }} /></div>
            <small>BLOCK THREAT</small>
          </div>
        </section>

        <section
          className={`fight-arena phase-${phase}`}
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) return
            if (phase === 'playing') arenaAttack()
          }}
          aria-label="Fight arena. Move into range, then tap or click to alternate punch and kick."
        >
          <div className="pixel-moon" aria-hidden="true" />
          <div className="city-backdrop" aria-hidden="true"><i /><i /><i /><i /><i /></div>
          <div className="web-lines" aria-hidden="true" />
          <Fighter side="hero" action={heroAction} position={heroPosition} />
          <Fighter side="villain" action={villainAction} position={villainPosition} />
          <div className="street" aria-hidden="true" />

          {phase === 'ready' && (
            <div className="fight-card">
              <span>SECRET MISSION FOUND</span>
              <h2>READY TO<br />SAVE THE BLOCK?</h2>
              <p>Move into range, then punch or kick. Jump to dodge, or attack while airborne for bonus damage. The villain fights back. You get two lives.</p>
              <button onClick={resetFight}>START FIGHT →</button>
            </div>
          )}

          {(phase === 'won' || phase === 'lost') && (
            <div className={`fight-card result ${phase}`}>
              <span>{phase === 'won' ? 'MISSION COMPLETE' : 'GAME OVER'}</span>
              <h2>{phase === 'won' ? <>CITY<br />SAVED!</> : <>TRY<br />AGAIN?</>}</h2>
              <p>{phase === 'won' ? 'The menace is down and the neighborhood is safe. Allegedly.' : 'Even heroes need a rematch. Your two lives have been used.'}</p>
              <button onClick={resetFight}>REMATCH →</button>
            </div>
          )}
        </section>

        <div className="fight-message" aria-live="polite">{message}</div>

        <section className="fight-controls" aria-label="Fight controls">
          <p>MOVE INTO RANGE <span>•</span> JUMP + ATTACK FOR BONUS DAMAGE</p>
          <div className="control-grid">
            <button disabled={phase !== 'playing'} onClick={() => moveHero(-1)} aria-label="Move back"><b>←</b><span>BACK<small>MAKE SPACE</small></span></button>
            <button disabled={phase !== 'playing'} onClick={() => moveHero(1)} aria-label="Move forward"><b>→</b><span>FORWARD<small>GET IN RANGE</small></span></button>
            <button disabled={phase !== 'playing' || isJumping} onClick={jump} aria-label="Jump"><b>↑</b><span>JUMP<small>DODGE + ATTACK</small></span></button>
            <button disabled={phase !== 'playing'} onClick={() => attack('punch')}><b>A</b><span>PUNCH<small>QUICK HIT</small></span></button>
            <button disabled={phase !== 'playing'} onClick={() => attack('kick')}><b>S</b><span>KICK<small>HEAVY HIT</small></span></button>
          </div>
        </section>
      </main>
    </div>
  )
}
