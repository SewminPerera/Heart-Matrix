import React from 'react';
import { Box } from '@react-three/drei';

function Car({ position = [0, 0, 0], color = 'red', size = [2, 1, 1], userData }) {
  const [width, height, depth] = size;
  return (
    <group position={position} userData={userData}>
      <Box args={[width, height, depth]} castShadow>
        <meshStandardMaterial color={color} />
      </Box>
      <Box position={[width * 0.25, height * 0.75, 0]} args={[width * 0.4, height * 0.5, depth * 0.9]}>
        <meshStandardMaterial color="lightblue" />
      </Box>
    </group>
  );
}

export default Car;
