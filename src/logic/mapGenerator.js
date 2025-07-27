import { sample } from 'lodash'

// Direcciones para conectar salas
const directions = [
  { dx: 1, dy: 0 },   // Derecha
  { dx: -1, dy: 0 },  // Izquierda
  { dx: 0, dy: 1 },   // Abajo
  { dx: 0, dy: -1 }   // Arriba
]

// Genera un mapa de N salas conectadas aleatoriamente
export function generateMap(roomCount = 10) {
  const map = new Map()
  const queue = [{ x: 0, y: 0 }]
  map.set('0,0', { x: 0, y: 0, type: 'start' })

  while (map.size < roomCount && queue.length > 0) {
    const current = queue.shift()

    for (let i = 0; i < 2; i++) {
      const dir = sample(directions)
      const nx = current.x + dir.dx
      const ny = current.y + dir.dy
      const key = `${nx},${ny}`

      if (!map.has(key)) {
        map.set(key, {
          x: nx,
          y: ny,
          type: map.size === roomCount - 1 ? 'boss' : 'normal'
        })
        queue.push({ x: nx, y: ny })
      }
    }
  }

  return map
}
