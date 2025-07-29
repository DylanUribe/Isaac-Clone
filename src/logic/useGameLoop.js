import { useEffect, useRef } from 'react'
import { useRoomStore } from './useRoomStore'
import { usePlayerStore } from './usePlayerStore'

export const useGameLoop = (callback) => {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    let id

    const loop = () => {
      // Ejecutar función pasada por el usuario
      callbackRef.current?.()

      // Funciones principales del juego
      const roomStore = useRoomStore.getState()
      const playerStore = usePlayerStore.getState()

      roomStore.checkPowerUps()
      roomStore.checkPowerUpPickup()
      playerStore.tickInvincibility()
      playerStore.tickDamageCooldown()

      // Obtener estado actual necesario para detección
      const currentRoom = roomStore.currentRoom
      const room = roomStore.map.get(currentRoom)

      // Asumiendo que 'roomEnemies' es parte del estado de la habitación
      const roomEnemies = roomStore.roomEnemies || [] // Ajusta según tu estado real

      const playerX = playerStore.x
      const playerY = playerStore.y
      
      const doorsUnlocked = roomEnemies.length === 0

      if (doorsUnlocked) {
        const doorPadding = 10 // margen para colisión

        // Puerta arriba
        if (playerY < 20 + doorPadding && playerX >= 360 && playerX <= 420) {
          roomStore.move('up')
          id = requestAnimationFrame(loop)
          return
        }

        // Puerta abajo
        if (playerY > 580 - 32 - doorPadding && playerX >= 360 && playerX <= 420) {
          roomStore.move('down')
          id = requestAnimationFrame(loop)
          return
        }

        // Puerta izquierda
        if (playerX < 20 + doorPadding && playerY >= 260 && playerY <= 320) {
          roomStore.move('left')
          id = requestAnimationFrame(loop)
          return
        }

        // Puerta derecha
        if (playerX > 780 - 32 - doorPadding && playerY >= 260 && playerY <= 320) {
          roomStore.move('right')
          id = requestAnimationFrame(loop)
          return
        }
      }

      id = requestAnimationFrame(loop)
    }

    id = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(id)
  }, [])
}

