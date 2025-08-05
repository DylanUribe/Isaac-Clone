import { create } from 'zustand'

export const usePlayerStore = create((set, get) => ({
  x: 400,
  y: 300,
  speed: 2,
  hp: 5,
  maxHp: 5,
  moveDir: { x: 0, y: 0 },
  damageCooldown: 0,
  isBlinking: false,
  isVisible: true, 
  knockback: { x: 0, y: 0 },
  isInvincible: false,
  invincibilityFrames: 0,
  blinkTimer: 0,

  
  setMoveDir: (dir) => set({ moveDir: dir }),

  updatePosition: () => {
    const { x, y, moveDir, knockback, speed } = get()

    const newX = x + moveDir.x * speed + knockback.x
    const newY = y + moveDir.y * speed + knockback.y

    // Límites del mapa
    const svgWidth = 800
    const svgHeight = 600
    const playerSize = 20
    const border = 2

    const minX = 0 + border
    const minY = 0 + border
    const maxX = svgWidth - playerSize - border
    const maxY = svgHeight - playerSize - border

    // Aplica el cerco
    const clampedX = Math.max(minX, Math.min(newX, maxX))
    const clampedY = Math.max(minY, Math.min(newY, maxY))

    set({
      x: clampedX,
      y: clampedY,
      knockback: { x: 0, y: 0 }
    })
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
    set({
      isInvincible: true,
      invincibilityFrames: frames,
      isBlinking: true
    });
  },

  takeDamage: (amount, sourceX, sourceY) => {
    const { hp, damageCooldown, x, y, isInvincible } = get()

    // Validar que sourceX/sourceY sean números
    if (
      typeof sourceX !== 'number' || isNaN(sourceX) ||
      typeof sourceY !== 'number' || isNaN(sourceY)
    ) {
      console.warn("takeDamage: Coordenadas de origen inválidas", { sourceX, sourceY })
      return
    }

    if (damageCooldown <= 0 && hp > 0 && !isInvincible) {
      const dx = x - sourceX
      const dy = y - sourceY
      const distance = Math.sqrt(dx * dx + dy * dy) || 1
      const knockbackForce = 40
      const angle = Math.atan2(dy, dx)

      set({
        hp: Math.max(0, hp - amount),
        damageCooldown: 60,
        isInvincible: true,
        invincibilityFrames: 60,
        isBlinking: true,
        knockback: {
          x: Math.cos(angle) * knockbackForce,
          y: Math.sin(angle) * knockbackForce,
        },
      })
    }
  },


  tickInvincibility: () => {
    const { invincibilityFrames } = get();
    if (invincibilityFrames > 0) {
      const newFrames = invincibilityFrames - 1;
      const shouldBlink = newFrames % 10 < 5;


      set({
        invincibilityFrames: newFrames,
        isBlinking: shouldBlink
      });
    } else {
      set({
        isInvincible: false,
        isBlinking: false
      });
    }
  },

  tickDamageCooldown: () => {
    const { damageCooldown } = get()
    if (damageCooldown > 0) {
      set({ damageCooldown: damageCooldown - 1 })
    }
  },

  teleportToRoomEntrance: (direction) => {
    const playerSize = 20;
    const svgWidth = 800;
    const svgHeight = 600;
    const edgeMargin = 4; // lo cerca que puede estar del borde
    const entryOffset = 40; // cuán lejos se aleja del borde al entrar

    let newX = get().x;
    let newY = get().y;

    switch (direction) {
      case 'left':
        newX = svgWidth - playerSize - edgeMargin;
        newY = svgHeight / 2 - playerSize / 2;
        break;
      case 'right':
        newX = edgeMargin;
        newY = svgHeight / 2 - playerSize / 2;
        break;
      case 'up':
        newX = svgWidth / 2 - playerSize / 2;
        newY = svgHeight - playerSize - edgeMargin;
        break;
      case 'down':
        newX = svgWidth / 2 - playerSize / 2;
        newY = edgeMargin;
        break;
    }

    // Aplica el offset para alejarlo de la puerta
    if (direction === 'left') newX -= entryOffset;
    if (direction === 'right') newX += entryOffset;
    if (direction === 'up') newY -= entryOffset;
    if (direction === 'down') newY += entryOffset;

    set({ x: newX, y: newY });
  }

}))
