import React from 'react';
import { useRoomStore } from '../logic/useRoomStore';

const MiniMap = () => {
  const map = useRoomStore((state) => state.map);
  const currentRoom = useRoomStore((state) => state.currentRoom);

  const mapArray = Array.from(map.keys()).map((key) => {
    const [x, y] = key.split(',').map(Number);
    return { key, x, y };
  });

  // Calcular bounds para centrar el mapa
  const minX = Math.min(...mapArray.map((r) => r.x));
  const minY = Math.min(...mapArray.map((r) => r.y));
  const maxX = Math.max(...mapArray.map((r) => r.x));
  const maxY = Math.max(...mapArray.map((r) => r.y));

  const roomSize = 20;

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#0008',
        padding: 5,
        borderRadius: 5,
      }}
    >
      <svg
        width={(maxX - minX + 1) * roomSize}
        height={(maxY - minY + 1) * roomSize}
      >
        {mapArray.map(({ key, x, y }) => {
          const isCurrent = key === currentRoom;
          return (
            <rect
              key={key}
              x={(x - minX) * roomSize}
              y={(y - minY) * roomSize}
              width={roomSize - 2}
              height={roomSize - 2}
              fill={isCurrent ? 'yellow' : '#444'}
              stroke="#999"
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default MiniMap;
