import { create } from 'zustand'

export const usePlayerStore = create((set, get) => ({
  x: 400,
  y: 300,
  speed: 2.5,
  hp: 5,
  maxHp: 5,
  moveDir: { x: 0, y: 0 },
  damageCooldown: 0,
  isBlinking: false,
  isVisible: true, 
  knockback: { x: 0, y: 0 },
  isInvincible: false,
  invincibilityFrames: 0,
  
  setMoveDir: (dir) => set({ moveDir: dir }),

  updatePosition: () => {
    const { x, y, moveDir, knockback } = get()
    const speed = 2
    const newX = x + moveDir.x * speed + knockback.x
    const newY = y + moveDir.y * speed + knockback.y
    set({ x: newX, y: newY, knockback: { x: 0, y: 0 } }) // aplicamos knockback solo una vez
  },

  heal: (amount) => {
    set((state) => ({
      hp: Math.min(state.hp + amount, state.maxHp)
    }))
  },

  increaseMaxHp: (amount) => {
    set((state) => ({
      maxHp: state.maxHp + amount,
      hp: state.hp + amount
    }))
  },

  increaseSpeed: (amount) => {
    set((state) => ({
      speed: state.speed + amount
    }))
  },

  setInvincible: (frames) => {
    set(() => ({
      isInvincible: true,
      invincibilityFrames: frames
    }))
  },

  takeDamage: (amount, sourceX, sourceY) => {
    const { hp, damageCooldown, x, y, isInvincible } = get()
    if (damageCooldown <= 0 && hp > 0 && !isInvincible) {
      const dx = x - sourceX
      const dy = y - sourceY
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      const knockbackForce = 40

      set({
        hp: Math.max(0, hp - amount),
        damageCooldown: 60,
        isInvincible: true,
        invincibilityFrames: 60,
        knockback: {
          x: (dx / distance) * knockbackForce,
          y: (dy / distance) * knockbackForce
        }
      })
    }
  },

  tickInvincibility: () => {
    const { invincibilityFrames } = get()
    if (invincibilityFrames > 0) {
      const newFrames = invincibilityFrames - 1
      set({
        invincibilityFrames: newFrames,
        isInvincible: newFrames > 0
      })
    }
  },

  tickDamageCooldown: () => {
    const { damageCooldown } = get()
    if (damageCooldown > 0) {
      set({ damageCooldown: damageCooldown - 1 })
    }
  },

}))
