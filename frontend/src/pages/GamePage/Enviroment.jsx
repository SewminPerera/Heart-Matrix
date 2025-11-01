import React from 'react';
import { Box } from '@react-three/drei';

export function Tree({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Box position={[0, 0.5, 0]} args={[0.5, 1, 0.5]} castShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box position={[0, 1.5, 0]} args={[1.2, 1.2, 1.2]} castShadow>
        <meshStandardMaterial color="#4CAF50" />
      </Box>
    </group>
  );
}
