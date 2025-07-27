import { random, uniqueId } from 'lodash'

export function generateEnemies(count = 3) {
  const enemies = []

  for (let i = 0; i < count; i++) {
    enemies.push({
      id: uniqueId('enemy_'),
      x: random(50, 700),
      y: random(50, 500),
      hp: 3,
      type: 'basic'
    })
  }

  return enemies
}
