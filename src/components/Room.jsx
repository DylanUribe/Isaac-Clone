import { useRoomStore } from '../logic/useRoomStore'
import { useProjectileStore } from '../logic/useProjectileStore'
import { useEffect, useState } from 'react'

export default function Room() {
  const map = useRoomStore((state) => state.map)
  const currentRoom = useRoomStore((state) => state.currentRoom)
  const moveToRoom = useRoomStore((state) => state.moveToRoom)
  const projectiles = useProjectileStore((state) => state.projectiles)
  const { shakeX, shakeY } = useRoomStore()
  const enemiesMap = useRoomStore((state) => state.enemies)

  const current = map.get(currentRoom)
  const hasTopRoom = map.has(`${current.x},${current.y - 1}`)
  const hasBottomRoom = map.has(`${current.x},${current.y + 1}`)
  const hasLeftRoom = map.has(`${current.x - 1},${current.y}`)
  const hasRightRoom = map.has(`${current.x + 1},${current.y}`)


  const enemies = enemiesMap instanceof Map && currentRoom
    ? enemiesMap.get(currentRoom) || []
    : []

  const [locked, setLocked] = useState(true)

  useEffect(() => {
    const allDead = enemies.length === 0 || enemies.every(enemy => enemy.hp <= 0)
    setLocked(!allDead)
  }, [enemies])

  const doorColor = locked ? 'darkred' : 'green'

  return (
    <>
      {/* Puertas (rectángulos SVG) */}
      {hasTopRoom && <rect x={380} y={0} width={40} height={20} fill={doorColor} />}
      {hasBottomRoom && <rect x={380} y={580} width={40} height={20} fill={doorColor} />}
      {hasLeftRoom && <rect x={0} y={280} width={20} height={40} fill={doorColor} />}
      {hasRightRoom && <rect x={780} y={280} width={20} height={40} fill={doorColor} />}
    </>
  )
}
