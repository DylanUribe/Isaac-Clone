import { usePlayerStore } from '../logic/usePlayerStore'

export default function Player() {
  const { x, y, isVisible } = usePlayerStore()
  
return (
  <div
  style={{
    position: 'absolute',
    left: x,
    top: y,
    width: 32,
    height: 32,
    backgroundColor: 'blue',
    borderRadius: '50%',
    opacity: isVisible ? 1 : 0
  }}
/>

)}

