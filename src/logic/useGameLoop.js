import { useEffect } from 'react'
import { useRoomStore } from './useRoomStore'
import { usePlayerStore } from './usePlayerStore'

export const useGameLoop = (callback) => {
  useEffect(() => {
    let id

    const loop = () => {
      callback()
      
      // ✅ Aquí es seguro llamar funciones que usan setState
      useRoomStore.getState().checkPowerUps()
      useRoomStore.getState().checkPowerUpPickup()
      usePlayerStore.getState().tickInvincibility()
      usePlayerStore.getState().tickDamageCooldown()

      id = requestAnimationFrame(loop)
    }

    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [callback])
}
