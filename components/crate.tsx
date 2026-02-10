"use client";

import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ModelProps } from "./boat";

export default function CrateModel({ ...props }: ModelProps) {
  const obj = useLoader(OBJLoader, props.url);

  return (
    <primitive
      object={obj}
      scale={props.scale}
      rotations={props.rotation}
      position={props.position}
      
      children-0-castShadow
    />
  );
}
