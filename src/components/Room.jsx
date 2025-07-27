import { useRoomStore } from '../logic/useRoomStore'
import Enemy from './Enemy'
import Player from './Player'
import Projectile from './Projectile'
import { useProjectileStore } from '../logic/useProjectileStore'

export default function Room() {
  const map = useRoomStore((state) => state.map)
  const currentRoom = useRoomStore((state) => state.currentRoom)
  const enemies = useRoomStore((state) => state.enemies)
  const moveToRoom = useRoomStore((state) => state.moveToRoom)
  const projectiles = useProjectileStore((state) => state.projectiles)
  const { shakeX, shakeY } = useRoomStore()

  const room = map?.get(currentRoom)
  const enemyList = enemies instanceof Map ? enemies.get(currentRoom) || [] : []

  const directions = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  }

  const tryMove = (dx, dy) => {
    if (!currentRoom) return
    let x = 0, y = 0
    if (typeof currentRoom === 'string' && currentRoom.includes(',')) {
      [x, y] = currentRoom.split(',').map(Number)
    } else {
      console.warn('currentRoom malformado:', currentRoom)
    }
    const key = `${x + dx},${y + dy}`
    moveToRoom(key)
  }

  return (
    <div
      style={{
        transform: `translate(${shakeX}px, ${shakeY}px)`,
        transition: 'transform 0.05s',
        padding: 20,
        color: 'white',
        position: 'relative',
        height: '100%',
        backgroundColor: '#111',
        flexGrow: 1
      }}
    >
      <h2>{room ? room.type.toUpperCase() + ' ROOM' : 'Loading...'}</h2>
      <p>Position: {currentRoom}</p>

      {/* Jugador */}
      <Player />

      {/* Proyectiles */}
      <>
        {projectiles.map((p) => (
          <Projectile key={p.id} x={p.x} y={p.y} />
        ))}
      </>

      {/* Enemigos */}
      {enemyList.map((enemy) => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}

      {/* Botones de dirección */}
      <div style={{ marginTop: 20 }}>
        {Object.entries(directions).map(([dir, [dx, dy]]) => {
          const [x, y] = currentRoom.split(',').map(Number)
          const key = `${x + dx},${y + dy}`
          return (
            <button
              key={dir}
              onClick={() => tryMove(dx, dy)}
              disabled={!map?.has(key)}
              style={{ margin: 5 }}
            >
              {dir}
            </button>
          )
        })}
      </div>
    </div>
  )
}
