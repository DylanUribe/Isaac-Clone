import { useEffect, useRef } from 'react'
import { useRoomStore } from './useRoomStore'
import { usePlayerStore } from './usePlayerStore'
import { useProjectileStore } from './useProjectileStore'

function moveTowardPlayer(enemy, playerX, playerY, speed) {
  const dx = playerX - enemy.x
  const dy = playerY - enemy.y
  const distance = Math.sqrt(dx * dx + dy * dy) || 1

  return {
    ...enemy,
    x: enemy.x + (dx / distance) * speed,
    y: enemy.y + (dy / distance) * speed,
  }
}

export const useGameLoop = (callback) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    let animationFrameId

    const loop = () => {
      callbackRef.current?.()

      const roomStore = useRoomStore.getState()
      const playerStore = usePlayerStore.getState()
      const projectileStore = useProjectileStore.getState()

      // Power-ups, invencibilidad, etc
      roomStore.checkPowerUps?.()
      roomStore.checkPowerUpPickup?.()
      playerStore.tickInvincibility?.()
      playerStore.tickDamageCooldown?.()

      // Actualizar proyectiles
      projectileStore.updateProjectiles?.()

      // Detectar colisiones proyectiles enemigos contra jugador
      for (const p of projectileStore.projectiles) {
        if (p.owner === 'enemy') {
          const dx = playerStore.x - p.x
          const dy = playerStore.y - p.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 20) {  // Ajusta el radio según necesites
            playerStore.takeDamage(1, p.x, p.y)
            // Opcional: remover proyectil después del impacto
            // Puedes implementar eso en updateProjectiles o aquí
          }
        }
      }

      const currentRoom = roomStore.currentRoom
      const enemiesMap = roomStore.enemies
      const roomEnemies = enemiesMap.get(currentRoom) || []
      const playerX = playerStore.x
      const playerY = playerStore.y

      // Actualizar enemigos con cooldown y disparo
      const newEnemies = roomEnemies.map(enemy => {
        if (enemy.hp <= 0) return enemy

        if (enemy.type === 'shooter') {
          let shootCooldown = (enemy.shootCooldown ?? 0) - 1

          if (shootCooldown <= 0) {
            projectileStore.spawnProjectile(enemy.x, enemy.y, playerX, playerY, 'enemy')
            console.log(`shooter ${enemy.id} fired!`)
            shootCooldown = 120
          }

          return {
            ...enemy,
            shootCooldown
          }
        } else {
          // Mover enemigo y devolver la versión actualizada
          return moveTowardPlayer(enemy, playerX, playerY, enemy.speed)
        }
      })

      // Actualizar mapa de enemigos con los enemigos modificados
      const newEnemiesMap = new Map(enemiesMap)
      newEnemiesMap.set(currentRoom, newEnemies)

      // Guardar enemigos actualizados en el store
      useRoomStore.setState({ enemies: newEnemiesMap })

      // Condición para puertas desbloqueadas
      const doorsUnlocked = newEnemies.every(e => e.hp <= 0)
      const doorPadding = 10

      if (doorsUnlocked) {
        if (playerY < 20 + doorPadding && playerX >= 360 && playerX <= 420) {
          roomStore.move('up')
          animationFrameId = requestAnimationFrame(loop)
          return
        }
        if (playerY > 580 - 32 - doorPadding && playerX >= 360 && playerX <= 420) {
          roomStore.move('down')
          animationFrameId = requestAnimationFrame(loop)
          return
        }
        if (playerX < 20 + doorPadding && playerY >= 260 && playerY <= 320) {
          roomStore.move('left')
          animationFrameId = requestAnimationFrame(loop)
          return
        }
        if (playerX > 780 - 32 - doorPadding && playerY >= 260 && playerY <= 320) {
          roomStore.move('right')
          animationFrameId = requestAnimationFrame(loop)
          return
        }
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    animationFrameId = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animationFrameId)
  }, [])
}
