export default function Enemy({ enemy }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: enemy.x,
        top: enemy.y,
        width: 30,
        height: 30,
        backgroundColor: 'green',
        border: '2px solid black',
        borderRadius: 6,
        textAlign: 'center',
        color: 'white'
      }}
    >
      {enemy.hp}
    </div>
  )
}
