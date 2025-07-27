import { create } from 'zustand'
import { uniqueId } from 'lodash'

export const useProjectileStore = create((set, get) => ({
  projectiles: [],
  speed: 6,
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
      dx: dx / normalized,
      dy: dy / normalized
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
    const { projectiles, speed } = get()
    const newProjectiles = projectiles
      .map((p) => ({
        ...p,
        x: p.x + p.dx * speed,
        y: p.y + p.dy * speed
      }))
      .filter((p) => p.x >= 0 && p.x <= 800 && p.y >= 0 && p.y <= 600)

    set({ projectiles: newProjectiles })
  }
  
}))
