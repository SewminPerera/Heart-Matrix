import React from "react";
import { useGLTF } from "@react-three/drei";

function Car({
  position = [0, 0, 0],
  size = [2, 1, 1],
  carType = "small",
  userData,
}) {
  const { scene } = useGLTF(
    carType === "truck" ? "/models/truck.glb" : "/models/car.glb"
  );
  let rotationY;

  if (carType === 'truck') {
    rotationY = (userData.direction === 1) 
      ? Math.PI / 2   
      : -Math.PI / 2;  
  } else {
    rotationY = (userData.direction === 1) 
      ? -Math.PI / 2  
      : Math.PI / 2;  
  }


  return (
    <group position={position} userData={userData}>
      <primitive
        object={scene.clone()}
        castShadow
        
        // Adjust scale to fit your models
        scale={carType === "truck" ? 0.9 : 0.6}
        rotation={[0, rotationY, 0]} 
      />
    </group>
  );
}

useGLTF.preload("/models/truck.glb");
useGLTF.preload("/models/car.glb");

export default Car;