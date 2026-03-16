import React from "react";
import { Box } from "@react-three/drei";

export const LANE_WIDTH = 100;
export function GrassLane({ positionZ = 0 }) {
  const color = Math.random() > 0.5 ? "#67b56b" : "#5fa76f";
  return (
    <Box args={[LANE_WIDTH, 0.1, 1]} position={[0, -0.05, positionZ]}>
      <meshStandardMaterial color={color} />
    </Box>
  );
}

export function RoadLane({ positionZ = 0 }) {
  return (
    <Box args={[LANE_WIDTH, 0.1, 1]} position={[0, -0.05, positionZ]}>
      <meshStandardMaterial color="#4a4a4a" />
    </Box>
  );
}