import React, { useState, useRef, useEffect, useCallback,} from "react";
import { useFrame } from "@react-three/fiber";
import Player from "./Player";
import Car from "./Car";
import { GrassLane, RoadLane, LANE_WIDTH } from "./Lanes";
import { Tree, Coin } from "./Enviroment"; 

const INITIAL_LANES = 100;
const VISIBLE_RANGE = 100;

const DIFFICULTY_SETTINGS = {
  easy: {
    roadChance: 0.4,
    speedMin: 1.2,
    speedMax: 2.0,
    carCountMin: 1,
    carCountMax: 2,
    coinChance: 0.6,
  },
  medium: {
    roadChance: 0.55,
    speedMin: 1.8,
    speedMax: 2.8,
    carCountMin: 2,
    carCountMax: 3,
    coinChance: 0.5,
  },
  hard: {
    roadChance: 0.7,
    speedMin: 2.4,
    speedMax: 3.6,
    carCountMin: 2,
    carCountMax: 4,
    coinChance: 0.45,
  },
};

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

// Lane generator
function createLane(z, difficulty, forceGrass = false) {
  const cfg = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.easy;
  const type = forceGrass
    ? "grass"
    : Math.random() < cfg.roadChance
    ? "road"
    : "grass";

  const trees =
    type === "grass"
      ? Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => ({
          x: (Math.random() - 0.5) * LANE_WIDTH * 0.7,
          z,
        }))
      : [];

  const coins = [];
  if (Math.random() < cfg.coinChance) {
    const coinCount = Math.random() < 0.5 ? 1 : 2;
    for (let i = 0; i < coinCount; i++) {
      coins.push({
        id: `coin_${z}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        x: (Math.random() - 0.5) * LANE_WIDTH * 0.6,
        z,
        collected: false,
      });
    }
  }

  const carCount =
    type === "road"
      ? Math.floor(randRange(cfg.carCountMin, cfg.carCountMax + 0.999))
      : 0;

  return {
    id: `${type}_${z}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    positionZ: z,
    trees,
    coins,
    speed:
      type === "road" ? randRange(cfg.speedMin, cfg.speedMax) : 0,
    direction: Math.random() > 0.5 ? 1 : -1,
    carCount,
    carType: Math.random() > 0.6 ? "truck" : "small",
  };
}

// Main Scene
export default function GameScene({
  gameState,
  difficulty = "easy",
  onCollision,
  onCoinPickup,
  onStepScore,
  playerRef,
}) {
  const obstacleGroupRef = useRef();

  const [lanes, setLanes] = useState(() =>
    Array.from({ length: INITIAL_LANES }, (_, i) =>
      createLane(-i, difficulty, i === 0)
    )
  );

  // regenerate lanes when difficulty changes
  useEffect(() => {
    setLanes(() =>
      Array.from({ length: INITIAL_LANES }, (_, i) =>
        createLane(-i, difficulty, i === 0)
      )
    );
    if (playerRef?.current?.resetPosition) {
      playerRef.current.resetPosition();
    }
  }, [difficulty, playerRef]);

  const safeSpawnZ =
    lanes.find((l) => l.type === "grass")?.positionZ || 0;

  const handlePlayerMove = useCallback(
    (fromType, toType) => {
      if (onStepScore) onStepScore(fromType, toType);
    },
    [onStepScore]
  );

  useFrame(({ camera }) => {
    if (gameState !== "playing" || !playerRef.current?.mesh) return;

    const player = playerRef.current.mesh.position;
    const playerZ = Math.round(player.z);
    const playerX = player.x;

    // Infinite lane generation ahead of the player
    const farthestZ = Math.min(...lanes.map((l) => l.positionZ));
    if (playerZ - farthestZ < 10) {
      const newLane = createLane(farthestZ - 1, difficulty);
      setLanes((prev) => [...prev, newLane].slice(-VISIBLE_RANGE));
    }

    // Move cars and check collision
    if (obstacleGroupRef.current) {
      obstacleGroupRef.current.children.forEach((car) => {
        const { speed, direction } = car.userData;
        car.position.x += speed * direction * 0.016;

        if (direction === 1 && car.position.x > LANE_WIDTH / 2 + 3) {
          car.position.x = -LANE_WIDTH / 2 - 3;
        } else if (
          direction === -1 &&
          car.position.x < -LANE_WIDTH / 2 - 3
        ) {
          car.position.x = LANE_WIDTH / 2 + 3;
        }
      });

      // collision with cars
      for (const car of obstacleGroupRef.current.children) {
        if (Math.round(car.position.z) === playerZ) {
          const carWidth = car.userData.size[0];
          const playerWidth = 0.8;

          const carStart = car.position.x - carWidth / 2;
          const carEnd = car.position.x + carWidth / 2;
          const playerStart = playerX - playerWidth / 2;
          const playerEnd = playerX + playerWidth / 2;

          const hit = playerEnd > carStart && playerStart < carEnd;
          if (hit) {
            onCollision && onCollision();
            return;
          }
        }
      }
    }

    // Coin pickup
    const lane = lanes.find(
      (l) => Math.round(l.positionZ) === playerZ
    );
    if (lane && lane.coins && lane.coins.length > 0) {
      let changed = false;
      const updatedCoins = lane.coins.map((c) => {
        if (!c.collected && Math.abs(c.x - playerX) < 0.8) {
          changed = true;
          onCoinPickup && onCoinPickup();
          return { ...c, collected: true };
        }
        return c;
      });

      if (changed) {
        setLanes((prev) =>
          prev.map((l) =>
            l.id === lane.id ? { ...l, coins: updatedCoins } : l
          )
        );
      }
    }

    // camera follow
    const targetPos = {
      x: player.x,
      y: player.y + 12,
      z: player.z + 15,
    };
    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(player.x, player.y + 1, player.z);
    camera.rotation.x = -0.35;
  });

  return (
    <>
      <color attach="background" args={["#b6e3ff"]} />
      <fog attach="fog" args={["#b6e3ff", 10, 80]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 40, 10]}
        intensity={1.5}
        castShadow
        color="#ffd28a"
      />

      {lanes.map((lane) => (
        <React.Fragment key={lane.id}>
          {lane.type === "grass" ? (
            <>
              <GrassLane positionZ={lane.positionZ} />
              {lane.trees.map((t, idx) => (
                <Tree key={`${lane.id}_tree_${idx}`} x={t.x} z={t.z} />
              ))}
            </>
          ) : (
            <RoadLane positionZ={lane.positionZ} />
          )}

          {lane.coins
            .filter((c) => !c.collected)
            .map((c) => (
              <Coin key={c.id} x={c.x} z={c.z} />
            ))}
        </React.Fragment>
      ))}

      <Player
        ref={playerRef}
        gameState={gameState}
        startZ={safeSpawnZ}
        lanes={lanes}
        onMove={handlePlayerMove}
      />

      <group ref={obstacleGroupRef}>
        {lanes
          .filter((lane) => lane.type === "road")
          .flatMap((lane) => {
            if (lane.carCount === 0) return [];
            const step = LANE_WIDTH / lane.carCount;
            const positions = Array.from(
              { length: lane.carCount },
              (_, i) => -LANE_WIDTH / 2 + i * step
            );

            return positions.map((pos, index) => {
              const size =
                lane.carType === "truck" ? [4, 1, 1.5] : [2, 1, 1];
              return (
                <Car
                  key={`${lane.id}_car_${index}`}
                  position={[pos, 0.5, lane.positionZ]}
                  carType={lane.carType}
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