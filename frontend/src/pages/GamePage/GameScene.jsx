import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Box } from '@react-three/drei';
import './GamePage.css';

const LANE_WIDTH = 30;
const INITIAL_LANES = 15;
const VISIBLE_RANGE = 20;

// --- Lane Types ---
function GrassLane({ positionZ = 0 }) {
  return (
    <Box args={[LANE_WIDTH, 0.1, 1]} position={[0, -0.05, positionZ]} receiveShadow>
      <meshStandardMaterial color="#5d9e5f" />
    </Box>
  );
}

function RoadLane({ positionZ = 0 }) {
  return (
    <Box args={[LANE_WIDTH, 0.1, 1]} position={[0, -0.05, positionZ]} receiveShadow>
      <meshStandardMaterial color="#6b7280" />
    </Box>
  );
}

// --- Car ---
function Car({ position = [0, 0, 0], color = 'red', size = [2, 1, 1], userData }) {
  const [width, height, depth] = size;
  return (
    <group position={position} userData={userData}>
      <Box args={[width, height, depth]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>
      <Box
        position={[width * 0.25, height * 0.75, 0]}
        args={[width * 0.4, height * 0.5, depth * 0.9]}
      >
        <meshStandardMaterial color="lightblue" />
      </Box>
    </group>
  );
}

// --- Player ---
const Player = forwardRef(({ gameState }, ref) => {
  const playerPositionRef = useRef({ x: 0, z: 0 });
  const meshRef = useRef();
  const [spring, api] = useSpring(() => ({
    position: [0, 0.5, 0],
    config: { mass: 1, tension: 280, friction: 25 },
  }));

  useImperativeHandle(ref, () => ({
    resetPosition() {
      playerPositionRef.current = { x: 0, z: 0 };
      api.start({ position: [0, 0.5, 0], immediate: true });
    },
    mesh: meshRef.current,
  }));

  const handleKeyDown = useCallback(
    (e) => {
      if (gameState !== 'playing') return;
      e.preventDefault();
      const { x, z } = playerPositionRef.current;
      let newX = x,
        newZ = z;

      switch (e.key) {
        case 'ArrowUp':
          newZ -= 1;
          break;
        case 'ArrowDown':
          newZ += 1;
          break;
        case 'ArrowLeft':
          newX -= 1;
          break;
        case 'ArrowRight':
          newX += 1;
          break;
        default:
          return;
      }

      playerPositionRef.current = { x: newX, z: newZ };
      api.start({ position: [newX, 0.5, newZ] });
    },
    [gameState, api]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <animated.mesh ref={meshRef} position={spring.position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'#f6d860'} />
    </animated.mesh>
  );
});

// --- Infinite Game Scene ---
function GameScene({ gameState, onCollision, playerRef }) {
  const obstacleGroupRef = useRef();
  const [lanes, setLanes] = useState(() =>
    Array.from({ length: INITIAL_LANES }, (_, i) => createLane(-i))
  );

  // === FRAME LOOP ===
  useFrame(({ camera }) => {
    if (gameState !== 'playing' || !playerRef.current?.mesh) return;

    const player = playerRef.current.mesh.position;
    const playerZ = Math.round(player.z);

    // Infinite lane generation
    const farthestZ = Math.min(...lanes.map((l) => l.positionZ));
    if (playerZ - farthestZ < 10) {
      const newLane = createLane(farthestZ - 1);
      setLanes((prev) => [...prev, newLane].slice(-VISIBLE_RANGE));
    }

    // Move cars
    if (obstacleGroupRef.current) {
      obstacleGroupRef.current.children.forEach((car) => {
        const { speed, direction } = car.userData;
        car.position.x += speed * direction * 0.016;
        if (direction === 1 && car.position.x > LANE_WIDTH / 2 + 3)
          car.position.x = -LANE_WIDTH / 2 - 3;
        else if (direction === -1 && car.position.x < -LANE_WIDTH / 2 - 3)
          car.position.x = LANE_WIDTH / 2 + 3;
      });

      // Collision detection
      const playerX = player.x;
      for (const car of obstacleGroupRef.current.children) {
        if (Math.round(car.position.z) === playerZ) {
          const carWidth = car.userData.size[0];
          const carStart = car.position.x - carWidth / 2;
          const carEnd = car.position.x + carWidth / 2;
          if (playerX > carStart && playerX < carEnd) {
            onCollision();
            return;
          }
        }
      }
    }

    // 🎥 Smooth camera follow
    const targetPos = {
      x: player.x,
      y: player.y + 12, // height above player
      z: player.z + 15, // behind player
    };

    camera.position.lerp(targetPos, 0.08); // smooth interpolation
    camera.lookAt(player.x, player.y + 1, player.z);
    camera.rotation.x = -0.35; // slightly tilt camera down for better view
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow />

      {/* Lanes */}
      {lanes.map((lane) =>
        lane.type === 'grass' ? (
          <GrassLane key={lane.id} positionZ={lane.positionZ} />
        ) : (
          <RoadLane key={lane.id} positionZ={lane.positionZ} />
        )
      )}

      {/* Player */}
      <Player ref={playerRef} gameState={gameState} />

      {/* Cars */}
      <group ref={obstacleGroupRef}>
        {lanes
          .filter((lane) => lane.type === 'road')
          .flatMap((lane) => {
            const positions = Array.from(
              { length: lane.carCount },
              (_, i) => -LANE_WIDTH / 2 + i * (LANE_WIDTH / lane.carCount)
            );
            return positions.map((pos, index) => {
              const size = lane.carType === 'truck' ? [4, 1, 1.5] : [2, 1, 1];
              return (
                <Car
                  key={`${lane.id}-${index}`}
                  position={[pos, 0.5, lane.positionZ]}
                  color={lane.carType === 'truck' ? 'lightblue' : 'red'}
                  size={size}
                  userData={{ ...lane, size }}
                />
              );
            });
          })}
      </group>
    </>
  );
}

// --- Lane Generator ---
function createLane(z) {
  const type = Math.random() < 0.5 ? 'road' : 'grass';
  return {
    id: `${type}_${z}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    positionZ: z,
    speed: type === 'road' ? Math.random() * 1.5 + 2 : 0,
    direction: Math.random() > 0.5 ? 1 : -1,
    carCount: type === 'road' ? Math.floor(Math.random() * 3) + 1 : 0,
    carType: Math.random() > 0.6 ? 'truck' : 'small',
  };
}

export default GameScene;
