import React, {forwardRef, useRef, useEffect, useCallback, useImperativeHandle,} from "react";
import { useSpring, animated } from "@react-spring/three";
import { useGLTF } from "@react-three/drei";

const Player = forwardRef(function Player(
  { gameState, startZ, lanes, onMove },
  ref
) {
  const playerPositionRef = useRef({ x: 0, z: startZ });
  const meshRef = useRef();

  const [spring, api] = useSpring(() => ({
    position: [0, 0.5, startZ],
    config: { mass: 1, tension: 280, friction: 25 },
  }));

  
  const { scene } = useGLTF("/models/player.glb");
  const getLaneType = (z) => {
    const lane = lanes.find(
      (l) => Math.round(l.positionZ) === Math.round(z)
    );
    return lane ? lane.type : null;
  };

  const isBlocked = (newX, newZ) => {
    const lane = lanes.find(
      (l) => Math.round(l.positionZ) === Math.round(newZ)
    );
    if (!lane || lane.type !== "grass") return false;
    return lane.trees.some((t) => Math.abs(t.x - newX) < 0.6);
  };

  useImperativeHandle(ref, () => ({
    resetPosition() {
      playerPositionRef.current = { x: 0, z: startZ };
      api.start({ position: [0, 0.5, startZ], immediate: true });
    },
    mesh: meshRef.current,
  }));

  const handleKeyDown = useCallback(
    (e) => {
      if (gameState !== "playing") return;

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
      } else {
        return;
      }

      const { x, z } = playerPositionRef.current;
      let newX = x;
      let newZ = z;

      switch (e.key) {
        case "ArrowUp":
          newZ -= 1;
          break;
        case "ArrowDown":
          newZ += 1;
          break;
        case "ArrowLeft":
          newX -= 1;
          break;
        case "ArrowRight":
          newX += 1;
          break;
        default:
          return;
      }

      if (isBlocked(newX, newZ)) return;

      const fromType = getLaneType(z);
      const toType = getLaneType(newZ);

      playerPositionRef.current = { x: newX, z: newZ };
      api.start({ position: [newX, 0.5, newZ] });

      if (onMove) {
        onMove(fromType, toType);
      }
    },
    [gameState, api, lanes, onMove]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, {
        passive: false,
      });
  }, [handleKeyDown]);

  return (
    <animated.primitive
      ref={meshRef}
      position={spring.position} 
      castShadow
      object={scene} 
      scale={0.13} 
      rotation={[0, Math.PI, 0]} 
    />
  );
});

useGLTF.preload("/models/player.glb");
export default Player;