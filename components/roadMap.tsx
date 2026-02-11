"use client";

import { Canvas } from "@react-three/fiber";
import { Model } from "./boat";

import { OrbitControls } from "@react-three/drei";
import CrateModel from "./crate";

export default function RoadMap() {
  return (
    <>
      <div className="h-screen w-screen">
        <Canvas camera={{ position: [150, 150, 150], fov: 50 }}>
          <ambientLight intensity={Math.PI / 2} />
          <OrbitControls enableRotate={false} enableZoom={false} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            decay={0}
            intensity={Math.PI}
          />
          <pointLight
            position={[-10, -10, -10]}
            decay={0}
            intensity={Math.PI}
          />
          <Model
            url="/models/crate_2/scene.gltf"
            position={[0, -80, 10]}
            // rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            scale={10}
            renderText={true}
            textLabel="Cap: 1"
          />

          <Model
            url="/models/boat/scene.gltf"
            position={[10, -80, -100]}
            rotation={[10, 10, 10]}
            scale={50}
          />
        </Canvas>
      </div>
    </>
  );
}
