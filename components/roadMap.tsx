"use client";

import { Canvas } from "@react-three/fiber";
import { BoatModel } from "./boat";

import { OrbitControls } from "@react-three/drei";
import CrateModel from "./crate";

export default function RoadMap() {
  return (
    <>
      <div className=" h-screen w-screen">
        <Canvas camera={{ position: [150, 150, 150], fov: 50 }}>
          <ambientLight intensity={5} />
          <pointLight />
          <OrbitControls enableZoom={!true} enableRotate={!true} />
          <CrateModel
            url="/models/crate/crate.obj"
            position={[-20, 20, 60]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            scale={20}
          />

          <BoatModel
            url="/models/boat/scene.gltf"
            position={[-20, 0, 10]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            scale={20}
          />
        </Canvas>
      </div>
    </>
  );
}
