export default function Projectile({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 8,
        height: 8,
        backgroundColor: 'yellow',
        borderRadius: '50%',
        zIndex: 5
      }}
    />
  )
}
