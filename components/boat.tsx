"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface ModelProps {
  url: string;
  color?: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function BoatModel({ url, color = "#2d3436", ...props }: ModelProps) {
  const gltf = useLoader(GLTFLoader, url);

  return (
    <primitive
      object={gltf.scene}
      scale={props.scale}
      rotations={props.rotation}
      position={props.position}
      children-0-castShadow
    />
  );
}
