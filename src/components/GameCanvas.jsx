import { useEffect } from 'react'
import { usePlayerStore } from '../logic/usePlayerStore'
import Player from './Player'
import { useGameLoop } from '../logic/useGameLoop'

const keys = {}

export default function GameCanvas() {
  const move = usePlayerStore((state) => state.move)

  useEffect(() => {
    const down = (e) => keys[e.key] = true
    const up = (e) => keys[e.key] = false
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useGameLoop(() => {
    let dx = 0, dy = 0
    if (keys['ArrowUp'] || keys['w']) dy -= 1
    if (keys['ArrowDown'] || keys['s']) dy += 1
    if (keys['ArrowLeft'] || keys['a']) dx -= 1
    if (keys['ArrowRight'] || keys['d']) dx += 1
    if (dx !== 0 || dy !== 0) move(dx, dy)
  })

  return (
    <div
      style={{
        position: 'relative',
        width: 800,
        height: 600,
        border: '2px solid black',
        backgroundColor: '#222',
        overflow: 'hidden',
      }}
    >
      <Player />
    </div>
  )
}
