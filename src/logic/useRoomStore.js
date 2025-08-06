import { create } from 'zustand'
import { generateMap } from './mapGenerator'
import { generateEnemies } from './enemyFactory'
import { usePlayerStore } from './usePlayerStore'
import { applyPowerUpEffect } from './PowerUps'
import { useEffect } from 'react'
import { useProjectileStore } from './useProjectileStore';


const types = ['basic', 'fast', 'tank', 'shooter']

export const generateEnemiesForRoom = (roomId) => {
  const count = Math.floor(Math.random() * 4) + 2
  const enemies = []
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const x = Math.random() * 700 + 50
    const y = Math.random() * 500 + 50
    enemies.push(generateEnemies(type, x, y))
  }

  return enemies
}


export const useRoomStore = create((set, get) => {
  
  const initialMap = generateMap(10)

  // Precargar enemigos desde generateMap
  const enemiesMap = new Map()
  initialMap.forEach((room, key) => {
    if (room.enemies && room.enemies.length > 0) {
      enemiesMap.set(key, room.enemies)
    }
  })

  const enemyData = new Map()

  const getRandomPowerUpType = () => {
    const types = ['heal', 'maxHpUp', 'speedUp', 'invincibility']
    const index = Math.floor(Math.random() * types.length)
    return types[index]
  } 

  damageEnemy: (id, amount) =>
    set((state) => ({
      enemies: state.enemies.map((e) =>
        e.id === id ? { ...e, hp: Math.max(0, e.hp - amount) } : e
      )
    }))
  
  return {
    
    move: (direction) => {
      const { currentRoom, map, enemies } = get()

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
        return
      }

      // Verificar si hay enemigos vivos en la sala actual
      const currentEnemies = enemies.get(currentRoom) || []
      const allDefeated = currentEnemies.every((enemy) => enemy.hp <= 0)

      if (!allDefeated) {
        return
      }

      // Inicializar enemigos si no hay
      if (!enemies.has(newKey)) {
        const newEnemies = generateEnemiesForRoom(newKey)
        const newEnemiesMap = new Map(enemies)
        newEnemiesMap.set(newKey, newEnemies)
        set({ enemies: newEnemiesMap })
      }

      // Marcar la sala como visitada
      const newMap = new Map(map)
      if (newMap.has(newKey)) {
        newMap.set(newKey, { ...newMap.get(newKey), visited: true })
        set({ map: newMap })
      }

      set({ currentRoom: newKey })
      usePlayerStore.getState().teleportToRoomEntrance(direction)
    }, //agregado para boss room

    map: initialMap, 
    currentRoom: '0,0', 
    enemies: enemiesMap,
    moveToRoom: (key) => {
      if (typeof key !== 'string') {
        return
      }

      const map = get().map
      if (map.has(key)) {
        set({ currentRoom: key })
      } else {
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


      // Buscar el enemigo eliminado
      const removedEnemy = roomEnemies.find((e) => e.id === id)

      // Eliminarlo de la lista
      enemiesMap.set(
        roomKey,
        roomEnemies.filter((e) => e.id !== id)
      )

      // 30% de probabilidad de soltar power-up
      if (Math.random() < 0.3 && target) {
        const type = getRandomPowerUpType()
        useRoomStore.getState().spawnPowerUp(roomKey, target.x, target.y, type)
      }

      // Power-up aleatorio
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

      const enemiesMap = new Map(enemies)
      const roomEnemies = enemiesMap.get(currentRoom) || []

      const updatedEnemies = []

      const { projectiles } = useProjectileStore.getState()
      const { x: playerX, y: playerY } = usePlayerStore.getState()

      const hitByEnemy = projectiles.find((p) =>
        p.owner === 'enemy' &&
        p.age > 0 &&
        Math.abs(p.x - playerX) < 20 &&
        Math.abs(p.y - playerY) < 20
      )

      if (hitByEnemy) {
        usePlayerStore.getState().takeDamage(1) 
        useRoomStore.getState().triggerShake()
      }

      for (let i = 0; i < roomEnemies.length; i++) {
        const enemy = roomEnemies[i]
        const dx = playerX - enemy.x
        const dy = playerY - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1

        // Mover con la velocidad propia
        const speed = enemy.speed || 1.2

        // Poder especial del boss
        if (enemy.type === 'boss') {

          const distToPlayer = Math.hypot(playerX - enemy.x, playerY - enemy.y)
          if (distToPlayer < 80 && (!enemy.areaCooldown || enemy.areaCooldown <= 0)) {
            if (distToPlayer < 60) {
              usePlayerStore.getState().takeDamage(2) 
              useRoomStore.getState().triggerShake()
            }
            enemy.areaCooldown = 200
          } else if (enemy.areaCooldown > 0) {
            enemy.areaCooldown -= 1
          }

          //  Carga rápida hacia el jugador 
          if (!enemy.chargeCooldown || enemy.chargeCooldown <= 0) {
            const chargeSpeed = 150
            enemy.x += (dx / distance) * chargeSpeed
            enemy.y += (dy / distance) * chargeSpeed
            enemy.chargeCooldown = 400
          } else {
            enemy.chargeCooldown -= 1
          }
        
          // Dispara en 8 direcciones cada 80 ticks
          if (!enemy.bossPowerCooldown || enemy.bossPowerCooldown <= 0) {
            for (let angle = 0; angle < 360; angle += 45) {
              const rad = angle * Math.PI / 180
              const targetX = enemy.x + Math.cos(rad) * 100
              const targetY = enemy.y + Math.sin(rad) * 100
              useProjectileStore.getState().spawnProjectile(enemy.x, enemy.y, targetX, targetY, { owner: 'enemy', speed: 6 })
            }
            enemy.bossPowerCooldown = 150
          } else {
            enemy.bossPowerCooldown -= 1
          }
        }
        

        // Comportamiento shooter
        let newShootCooldown = enemy.shootCooldown || 0
        if (enemy.type === 'shooter') {
          if (newShootCooldown <= 0) {
            useProjectileStore.getState().spawnProjectile(enemy.x, enemy.y, playerX, playerY)
            newShootCooldown = 100
          } else {
            newShootCooldown -= 1
          }
        }
        // Detectar si fue golpeado por proyectil del jugador 
        const { projectiles } = useProjectileStore.getState()

        const hitboxSize = enemy.size || 32

        const hit = projectiles.find((p) =>
          p.owner === 'player' &&
          p.age > 0 &&
          p.x >= enemy.x - hitboxSize &&
          p.x <= enemy.x + hitboxSize &&
          p.y >= enemy.y - hitboxSize &&
          p.y <= enemy.y + hitboxSize
        )

        if (hit) {
          useRoomStore.getState().damageEnemy(enemy.id, 1)
          useRoomStore.getState().triggerShake()
        }

        const newX = enemy.x + (dx / distance) * speed
        const newY = enemy.y + (dy / distance) * speed

        // Evitar overlap
        const willOverlap = updatedEnemies.some((other) =>
          isOverlapping(newX, newY, other.x, other.y)
        )

        if (!willOverlap) {
          updatedEnemies.push({
            ...enemy,
            x: newX,
            y: newY,
            shootCooldown: newShootCooldown
          })
        } else {
          updatedEnemies.push({
            ...enemy,
            shootCooldown: newShootCooldown
          })
        }
      }

      enemiesMap.set(currentRoom, updatedEnemies)
      set({ enemies: new Map(enemiesMap) })
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

    damageEnemy: (id, amount) => {
      set((state) => {
        const roomKey = state.currentRoom
        const enemiesMap = new Map(state.enemies)
        const roomEnemies = enemiesMap.get(roomKey) || []

        const updatedEnemies = roomEnemies.map((enemy) => {
          if (enemy.id === id) {
            const newHp = Math.max(0, enemy.hp - amount)
            return { ...enemy, hp: newHp }
          }
          return enemy
        })

        enemiesMap.set(roomKey, updatedEnemies)
        return { enemies: enemiesMap }
      })
    },

    resetRooms: () => {
      const newMap = generateMap(10)
      const newEnemies = new Map()
      
      for (const [key, room] of newMap.entries()) {
        let enemies = []
        
        if (key === '0,0') {
          enemies = [] // no spawnear enemigos aquí
        } else if (room.isBossRoom) {
          enemies = [generateEnemies('boss', 300, 300)]
        } else {
          enemies = generateEnemiesForRoom(key)
        }

        room.enemies = enemies
        newEnemies.set(key, enemies)
      }

      useProjectileStore.setState({ projectiles: [] })


      set({
        map: newMap,
        currentRoom: '0,0',
        enemies: newEnemies,
        powerUps: new Map(),
      })
    }
  }
})

const ENEMY_SIZE = 30

function isOverlapping(x1, y1, x2, y2) {
  return !(
    x1 + ENEMY_SIZE < x2 ||
    x1 > x2 + ENEMY_SIZE ||
    y1 + ENEMY_SIZE < y2 ||
    y1 > y2 + ENEMY_SIZE
  )
}

