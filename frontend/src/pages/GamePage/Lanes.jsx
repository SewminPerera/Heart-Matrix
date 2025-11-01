import React from 'react';
import { Box } from '@react-three/drei';

const LANE_WIDTH = 30;

export function GrassLane({ positionZ = 0 }) {
  return (
    <Box args={[LANE_WIDTH, 0.1, 1]} position={[0, -0.05, positionZ]} receiveShadow>
      <meshStandardMaterial color="#5d9e5f" />
    </Box>
  );
}

export function RoadLane({ positionZ = 0 }) {
  return (
    <Box args={[LANE_WIDTH, 0.1, 1]} position={[0, -0.05, positionZ]} receiveShadow>
      <meshStandardMaterial color="#6b7280" />
    </Box>
  );
}

export const LANE_WIDTH_CONST = LANE_WIDTH;
