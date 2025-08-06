import { usePlayerStore } from './usePlayerStore'

export function applyPowerUpEffect(type) {
  const player = usePlayerStore.getState()

  switch (type) {
    case 'heal':
      player.heal(1) 
      break
    case 'maxHpUp':
      player.increaseMaxHp(1)
      break
    case 'speedUp':
      player.increaseSpeed(0.2)
      break
    case 'invincibility':
      player.setInvincible(480) 
      break
    default:
      console.warn(`Power-up desconocido: ${type}`)
  }
}
