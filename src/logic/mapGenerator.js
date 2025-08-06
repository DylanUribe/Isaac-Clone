import { sample } from 'lodash'
import { generateEnemies } from './enemyFactory'
import { generateEnemiesForRoom } from './useRoomStore'

// Direcciones posibles
const directions = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 }
]

export function generateMap(roomCount = 10) {
  
  const map = new Map()
  const queue = [{ x: 0, y: 0 }]
  map.set('0,0', { x: 0, y: 0, type: 'start' })

  // sala normal con enemigos
  map.set('1,0', {
    x: 1, y: 0,
    type: 'normal',
    enemies: generateEnemiesForRoom('1,0'),
    visited: false
  })
  

  // Boss room
  map.set('2,0', {
    x: 2, y: 0,
    type: 'boss',
    isBossRoom: true,
    enemies: [generateEnemies('boss', 200, 200)],
    visited: false
  })
  
  while (map.size < roomCount && queue.length > 0) {
    const current = queue.shift()

    for (let i = 0; i < 2; i++) {
      const dir = sample(directions)
      const nx = current.x + dir.dx
      const ny = current.y + dir.dy
      const key = `${nx},${ny}`

      if (!map.has(key)) {
        const isBoss = map.size === roomCount - 1
        const type = isBoss ? 'boss' : 'normal'

        map.set(key, {
          x: nx,
          y: ny,
          type,
          enemies: [generateEnemies(isBoss ? 'boss' : 'basic', 150, 150)],
          isBossRoom: isBoss,
          visited: false
        })

        queue.push({ x: nx, y: ny })
      }
    }
  }

  return map
}

