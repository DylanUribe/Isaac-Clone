import { usePlayerStore } from './usePlayerStore'

export function applyPowerUpEffect(type) {
  const player = usePlayerStore.getState()

  switch (type) {
    case 'heal':
      player.heal(1) // o el valor que quieras
      break
    case 'maxHpUp':
      player.increaseMaxHp(1)
      break
    case 'speedUp':
      player.increaseSpeed(0.5)
      break
    case 'invincibility':
      player.setInvincible(180) 
      break
    default:
      console.warn(`Power-up desconocido: ${type}`)
  }
}
