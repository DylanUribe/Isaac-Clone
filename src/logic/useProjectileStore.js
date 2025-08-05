import { create } from 'zustand'
import { uniqueId } from 'lodash'

export const useProjectileStore = create((set, get) => ({
  projectiles: [],
  speed: 3,
  cooldown: 200, // ms entre disparos
  lastShotTime: {
    up: 0,
    down: 0,
    left: 0,
    right: 0
  },

  shoot: (x, y, dx, dy, direction) => {
    const now = Date.now()
    const { lastShotTime, cooldown } = get()

    // Verifica si el cooldown ha pasado
    if (now - lastShotTime[direction] < cooldown) return

    const id = uniqueId('proj_')
    const normalized = Math.sqrt(dx * dx + dy * dy) || 1
    const projectile = {
      id,
      x,
      y,
      dx: (dx / normalized) * get().speed,
      dy: (dy / normalized) * get().speed,
      isEnemy: false,
      owner: 'player',
      damage: 1,
      age: 0,
    }


    set((state) => ({
      projectiles: [...state.projectiles, projectile],
      lastShotTime: {
        ...state.lastShotTime,
        [direction]: now
      }
    }))
  },

  updateProjectiles: () => {
    const { projectiles } = get()
    const newProjectiles = projectiles
      .map((p) => ({
        ...p,
        x: p.x + p.dx,
        y: p.y + p.dy,
        age: (p.age || 0) + 1
      }))
      .filter((p) => p.x >= 0 && p.x <= 800 && p.y >= 0 && p.y <= 600)

    set({ projectiles: newProjectiles })
  },

  spawnProjectile: (x, y, targetX, targetY, owner = 'enemy') => {
    const id = crypto.randomUUID()
    const dx = targetX - x
    const dy = targetY - y
    const distance = Math.sqrt(dx * dx + dy * dy) || 1
    const speed = 2
    const offset = 15 // distancia para que el proyectil aparezca adelantado

    const startX = x + (dx / distance) * offset
    const startY = y + (dy / distance) * offset

    const velocity = {
      dx: (dx / distance) * speed,
      dy: (dy / distance) * speed
    }

    set((state) => ({
      projectiles: [
        ...state.projectiles,
        {
          id,
          x: startX,
          y: startY,
          ...velocity,
          owner: 'enemy',
          age: 0,
          damage: 1,
        }
      ]
    }))
  }
}))