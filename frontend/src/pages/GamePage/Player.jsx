import React, { forwardRef, useRef, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/three';

const Player = forwardRef(({ gameState }, ref) => {
  const playerPositionRef = useRef({ x: 0, z: 0 });
  const meshRef = useRef();
  const [spring, api] = useSpring(() => ({
    position: [0, 0.5, 0],
    config: { mass: 1, tension: 280, friction: 25 },
  }));

  React.useImperativeHandle(ref, () => ({
    resetPosition() {
      playerPositionRef.current = { x: 0, z: 0 };
      api.start({ position: [0, 0.5, 0], immediate: true });
    },
    mesh: meshRef.current,
  }));

  const handleKeyDown = useCallback(
    (e) => {
      if (gameState !== 'playing') return;
      const { x, z } = playerPositionRef.current;
      let newX = x, newZ = z;
      switch (e.key) {
        case 'ArrowUp': newZ -= 1; break;
        case 'ArrowDown': newZ += 1; break;
        case 'ArrowLeft': newX -= 1; break;
        case 'ArrowRight': newX += 1; break;
        default: return;
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
      <meshStandardMaterial color="#f6d860" />
    </animated.mesh>
  );
});

export default Player;
