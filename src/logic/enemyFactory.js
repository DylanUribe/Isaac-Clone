import { random, uniqueId } from 'lodash'

export const generateEnemies = (type, x, y) => {
  switch (type) {
    case 'basic':
      return { id: crypto.randomUUID(), type, x, y, hp: 5, speed: 0.7 }
    case 'fast':
      return { id: crypto.randomUUID(), type, x, y, hp: 2, speed: 1 }
    case 'tank':
      return { id: crypto.randomUUID(), type, x, y, hp: 15, speed: 0.5 }
    case 'shooter':
      return { id: crypto.randomUUID(), type, x, y, hp: 4, speed:0.001, shootCooldown: 0 }
    case 'boss':
      return {
        id: crypto.randomUUID(),
        type: 'boss',
        x,
        y,
        hp: 50,
        speed: 0.5,
        shootCooldown: 0,
        specialAttackCooldown: 300
      }
    default:
      throw new Error(`Unknown enemy type: ${type}`)
  }
}

export function createBoss() {
  return {
    id: crypto.randomUUID(),
    type: 'boss',
    x: 300,
    y: 300,
    hp: 150,                
    speed: 0.7,
    shootCooldown: 0,
    specialAttackCooldown: 0,  // Empezar listo para atacar
    attackPatterns: ['shoot', 'area', 'charge'], // Ataques variados
    state: 'idle',          // Para manejar comportamiento
    lastAttackTime: 0
  }
}
