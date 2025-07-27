import { create } from 'zustand'
import { generateMap } from './mapGenerator'
import { generateEnemies } from './enemyFactory'
import { usePlayerStore } from './usePlayerStore'
import { applyPowerUpEffect } from './PowerUps'
import { useEffect } from 'react'

export const useRoomStore = create((set, get) => {
  
  const initialMap = generateMap(10)
  const enemyData = new Map()

  const getRandomPowerUpType = () => {
    const types = ['heal', 'maxHpUp', 'speedUp', 'invincibility']
    const index = Math.floor(Math.random() * types.length)
    return types[index]
  } 
  
  return {
    move: (direction) => {
      const { currentRoom, map, enemies } = get()

      // Asegúrate de que currentRoom es un string tipo "x,y"
      if (typeof currentRoom !== 'string') {
        console.warn('currentRoom inválido en move:', currentRoom)
        return
      }

      const [xStr, yStr] = currentRoom.split(',')
      const x = parseInt(xStr)
      const y = parseInt(yStr)

      let dx = 0
      let dy = 0
      if (direction === 'left') dx = -1
      if (direction === 'right') dx = 1
      if (direction === 'up') dy = -1
      if (direction === 'down') dy = 1

      const newKey = `${x + dx},${y + dy}`

      if (!map.has(newKey)) {
       console.warn('No hay sala en dirección', direction, newKey)
       return
      }

      if (!enemies.has(newKey)) {
        const newEnemies = generateEnemies()
        enemies.set(newKey, newEnemies)
      }

      set({ currentRoom: newKey })
    },

    map: initialMap, // ejemplo básico
    currentRoom: '0,0', // 🟢 ASEGURA ESTO
    enemies: new Map(),
    moveToRoom: (key) => {
      if (typeof key !== 'string') {
        console.warn('moveToRoom recibió algo que no es string:', key)
        return
      }

      const map = get().map
      if (map.has(key)) {
        set({ currentRoom: key })
      } else {
        console.warn('Sala no encontrada en el mapa:', key)
      }
    },


    powerUps: new Map(),

    spawnPowerUp: (roomKey, x, y, type) => {
      set((state) => {
        const powerUpsMap = new Map(state.powerUps)
        const currentRoomPowerUps = powerUpsMap.get(roomKey) || []
        const newPowerUp = { id: crypto.randomUUID(), x, y, type }
        powerUpsMap.set(roomKey, [...currentRoomPowerUps, newPowerUp])
        return { powerUps: powerUpsMap }
      })
    },

    removePowerUp: (roomKey, id) => {
      set((state) => {
        const powerUpsMap = new Map(state.powerUps)
        const updated = (powerUpsMap.get(roomKey) || []).filter(p => p.id !== id)
        powerUpsMap.set(roomKey, updated)
        return { powerUps: powerUpsMap }
      })
    },

    removeEnemy: (id) =>
    set((state) => {
      const roomKey = state.currentRoom
      const enemiesMap = new Map(state.enemies)
      const roomEnemies = enemiesMap.get(roomKey) || []
      const target = roomEnemies.find(e => e.id === id)


      // 🔍 Buscar el enemigo eliminado
      const removedEnemy = roomEnemies.find((e) => e.id === id)

      // 🧹 Eliminarlo de la lista
      enemiesMap.set(
        roomKey,
        roomEnemies.filter((e) => e.id !== id)
      )

      // 💥 30% de probabilidad de soltar power-up
      if (Math.random() < 0.3 && target) {
        const type = getRandomPowerUpType()
        useRoomStore.getState().spawnPowerUp(roomKey, target.x, target.y, type)
      }

      // ⚡ Power-up aleatorio
      const powerUpsMap = new Map(state.powerUps || new Map())
      if (removedEnemy && Math.random() < 0.3) {
        const newPowerUp = {
          id: crypto.randomUUID(),
          x: removedEnemy.x,
          y: removedEnemy.y,
          type: getRandomPowerUpType()
        }
        const current = powerUpsMap.get(roomKey) || []
        powerUpsMap.set(roomKey, [...current, newPowerUp])
      }

      return {
        enemies: new Map(enemiesMap),
        powerUps: new Map(powerUpsMap)
      }
    }),

    updateEnemies: () => {
      const { currentRoom, enemies } = get()
      const { x: playerX, y: playerY, hp, damageCooldown } = usePlayerStore.getState()
      const setPlayer = usePlayerStore.setState

      const speed = 1.2
      const now = Date.now()

      const enemiesMap = new Map(enemies)
      const roomEnemies = enemiesMap.get(currentRoom) || []

      const updatedEnemies = roomEnemies.map((enemy) => {
        const dx = playerX - enemy.x
        const dy = playerY - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        if (distance < 20) {
          const player = usePlayerStore.getState()
          if (player.damageCooldown <= 0) {
            usePlayerStore.getState().takeDamage(1, enemy.x, enemy.y)
            useRoomStore.getState().triggerShake()
          }
        }

        return {
          ...enemy,
          x: enemy.x + (dx / distance) * speed,
          y: enemy.y + (dy / distance) * speed
        }
      })

      enemiesMap.set(currentRoom, updatedEnemies)
      set({ enemies: new Map(enemiesMap) }) // Nuevo Map para forzar re-render
    },
    
    shakeX: 0,
    shakeY: 0,
    triggerShake: () => {
      let count = 0
      const interval = setInterval(() => {
        const x = (Math.random() - 0.5) * 10
        const y = (Math.random() - 0.5) * 10
        set({ shakeX: x, shakeY: y })
        if (++count > 5) {
          clearInterval(interval)
          set({ shakeX: 0, shakeY: 0 })
        }
      }, 50)
    },
    
    checkPowerUps: () => {
      const { x: px, y: py } = usePlayerStore.getState()
      const { currentRoom, powerUps } = get()
      const current = powerUps.get(currentRoom) || []

      const collected = []
      const remaining = []

      current.forEach((p) => {
        const dx = px - p.x
        const dy = py - p.y
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          collected.push(p)
        } else {
          remaining.push(p)
        }
      })

      if (collected.length > 0) {
        collected.forEach((p) => {
          applyPowerUpEffect(p.type) 
        })
        const newMap = new Map(powerUps)
        newMap.set(currentRoom, remaining)
        set({ powerUps: newMap })
      }
    },

    checkPowerUpPickup: () => {
      const { x, y } = usePlayerStore.getState()
      const { currentRoom, powerUps } = get()
      const powerUpsInRoom = powerUps.get(currentRoom) || []

      for (const powerUp of powerUpsInRoom) {
        const dx = x - powerUp.x
        const dy = y - powerUp.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < 20) {
          useRoomStore.getState().applyPowerUp(powerUp.type)
          useRoomStore.getState().removePowerUp(currentRoom, powerUp.id)
        }
      }
    },
  }
})
