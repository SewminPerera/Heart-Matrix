import React, { useRef } from "react";
import { Box, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Tree({ x, z }) {
  // Load the 3D model
  const { scene } = useGLTF("/models/tree.glb");

  return (
    <group position={[x, 0, z]}>
      <primitive 
        object={scene.clone()} 
        castShadow 
        scale={0.004}
      />
    </group>
  );
}

export function Coin({ x, z }) {
  const { scene } = useGLTF("/models/coin.glb");
  const coinRef = useRef();

  // This hook runs on every single frame
  useFrame((_state, delta) => {
    if (coinRef.current) {
      coinRef.current.rotation.y += delta * 2; 
    }
  });

  return (
    <group ref={coinRef} position={[x, 0.5, z]}> 
      <primitive
        object={scene.clone()}
        castShadow
        scale={0.9}
      />
    </group>
  );
}
useGLTF.preload("/models/tree.glb");
useGLTF.preload("/models/coin.glb");