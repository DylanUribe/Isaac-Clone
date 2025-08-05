import Room from './components/Room'
import { useEffect } from 'react'
import { usePlayerStore } from './logic/usePlayerStore'
import { useProjectileStore } from './logic/useProjectileStore'
import { useGameLoop } from './logic/useGameLoop'
import { useRoomStore } from './logic/useRoomStore'
import Player from './components/Player'; // ajusta la ruta si es diferente
import allEnemiesDead from './components/Room'; // ajusta la ruta si es diferente
import MiniMap from './components/MiniMap'


const keys = {}

function App() {
  const hp = usePlayerStore((state) => state.hp)
  const x = usePlayerStore((state) => state.x)
  const y = usePlayerStore((state) => state.y)
  const maxHp = usePlayerStore((state) => state.maxHp)
  const powerUps = useRoomStore((state) => state.powerUps)
  const currentRoom = useRoomStore((state) => state.currentRoom)
  const enemies = useRoomStore((state) => state.enemies) || new Map()
  const roomEnemies = enemies instanceof Map ? enemies.get(currentRoom) || [] : []
  
  useEffect(() => {
  const down = (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault()
    }
    keys[e.key.toLowerCase()] = true
  }
  const up = (e) => {
    keys[e.key.toLowerCase()] = false
  }

    window.addEventListener('keydown', down, { passive: false })
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useGameLoop(() => {
    // Movimiento del jugador
    const dx = (keys['a'] ? -1 : 0) + (keys['d'] ? 1 : 0)
    const dy = (keys['w'] ? -1 : 0) + (keys['s'] ? 1 : 0)
    const magnitude = Math.sqrt(dx * dx + dy * dy) || 1
    usePlayerStore.getState().setMoveDir({ x: dx / magnitude, y: dy / magnitude })
    usePlayerStore.getState().updatePosition()

    // Disparos con flechas
    const { x: playerX, y: playerY } = usePlayerStore.getState()
    if (keys['arrowup']) {
      useProjectileStore.getState().shoot(playerX + 12, playerY, 0, -1, 'up')
    } else if (keys['arrowdown']) {
      useProjectileStore.getState().shoot(playerX + 12, playerY + 32, 0, 1, 'down')
    } else if (keys['arrowleft']) {
      useProjectileStore.getState().shoot(playerX, playerY + 12, -1, 0, 'left')
    } else if (keys['arrowright']) {
      useProjectileStore.getState().shoot(playerX + 32, playerY + 12, 1, 0, 'right')
    }

    // Actualizar balas
    useProjectileStore.getState().updateProjectiles()

    updateProjectiles: () => {
      set((state) => {
        const updated = state.projectiles.map((p) => ({
          ...p,
          x: p.x + p.xVel,
          y: p.y + p.yVel,
          age: p.age + 1, // <= incrementa edad
        }))
        return { projectiles: updated }
      })
    }


    // Colisión balas-enemigos
    const { projectiles } = useProjectileStore.getState()
    const { enemies, currentRoom } = useRoomStore.getState()
    const roomEnemies = enemies.get(currentRoom) || []

    const projectilesToRemove = new Set()
    const enemiesToRemove = new Set()

    projectiles.forEach((proj) => {
      roomEnemies.forEach((enemy) => {
        const dx = proj.x - enemy.x
        const dy = proj.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 16) {
          projectilesToRemove.add(proj.id)

          // 🔽 Nueva lógica: restar vida
          enemy.hp -= proj.damage || 1
          if (enemy.hp <= 0) {
            enemiesToRemove.add(enemy.id)
          }
        }
      })
    })

    // Elimina proyectiles golpeados
    if (projectilesToRemove.size > 0) {
      useProjectileStore.setState((state) => ({
        projectiles: state.projectiles.filter((p) => !projectilesToRemove.has(p.id))
      }))
    }

    // Elimina enemigos golpeados
    if (enemiesToRemove.size > 0) {
      enemiesToRemove.forEach((id) => {
        useRoomStore.getState().removeEnemy(id)
      })
    }

    roomEnemies.forEach((enemy) => {
      const dx = enemy.x - playerX
      const dy = enemy.y - playerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < 20) {
        usePlayerStore.getState().takeDamage(1, enemy.x, enemy.y)
      }
    })

    //cooldown del daño
    usePlayerStore.getState().tickInvincibility()

    //actualizar a los enemigos
    useRoomStore.getState().updateEnemies()
  })

  return (
  <>
    <div>
      {/* Tu juego normal aquí */}
      <MiniMap />
    </div>

    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        margin: 0,
        padding: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>Mini Isaac Clone</h1>

      <svg
        width="800"
        height="600"
        style={{ background: '#111', border: '2px solid white' }}
      >

        {/* Sala con puertas */}
        <Room allEnemiesDead={allEnemiesDead} />

        {/* Jugador */}
        <Player />

        {/* Enemigos */}
        {roomEnemies.map((enemy) => {
          let color = 'gray'
          let width = enemy.size || 32
          let height = enemy.size || 32

          switch (enemy.type) {
            case 'basic':
              color = 'gray'
              break
            case 'fast':
              color = 'orange'
              break
            case 'tank':
              color = 'brown'
              break
            case 'shooter':
              color = 'purple'
              break
            case 'boss':
              color = 'crimson'
              width = enemy.size || 32
              height = enemy.size || 32
              break
            default:
              color = 'red'
          }

          return (
            <rect
              key={enemy.id}
              x={enemy.x}
              y={enemy.y}
              width={width}
              height={height}
              fill={color}
              stroke="black"
              strokeWidth={2}
            />
          )
        })}

        {/* Proyectiles */}
        {useProjectileStore.getState().projectiles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="yellow"
          />
        ))}

        {/* PowerUps */}
        {powerUps.get(currentRoom)?.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r="8"
            fill={
              p.type === 'heal'
                ? 'green'
                : p.type === 'speedUp'
                ? 'blue'
                : p.type === 'maxHpUp'
                ? 'orange'
                : p.type === 'invincibility'
                ? 'purple'
                : 'black'
            }
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Barra de vida */}
      <div
        style={{
          background: '#333',
          border: '2px solid #fff',
          width: 200,
          height: 24,
          margin: '16px auto',
          borderRadius: 8,
          position: 'relative',
        }}
      >
        <div
          style={{
            background: 'red',
            width: `${(hp / maxHp) * 100}%`,
            height: '100%',
            borderRadius: 8,
            transition: 'width 0.2s',
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            color: '#fff',
            top: 0,
            left: 0,
            lineHeight: '24px',
            fontWeight: 'bold',
          }}
        >
          {hp} / {maxHp}
        </span>
      </div>
    </div>
  </>
)}
export default App
