import { usePlayerStore } from '../logic/usePlayerStore'

export default function Player() {
  const x = usePlayerStore((state) => state.x)
  const y = usePlayerStore((state) => state.y)

  const isInvincible = usePlayerStore((state) => state.isInvincible) 
  const fillColor = isInvincible ? 'white' : 'blue'

  return (
    <rect
      x={x}
      y={y}
      width={32}
      height={32}
      fill={fillColor}
    />
  )
}
