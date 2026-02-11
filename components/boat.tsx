"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Text } from "@react-three/drei";

export interface ModelProps {
  url: string;
  color?: string;
  scale?: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  renderText?: boolean;
  textLabel?: string;
}

export function Model({
  url,
  renderText = false,
  textLabel = "",
  ...props
}: ModelProps) {
  const gltf = useLoader(GLTFLoader, url);

  return (
    <>
      <primitive
        object={gltf.scene}
        scale={props.scale}
        rotation={props.rotation}
        position={props.position}
        children-0-castShadow
      />

      {renderText ? (
        <Text
          position={[
            props.position?.[0],
            props.position?.[1] + 10,
            props.position?.[2] + 10,
          ]}
          scale={props.scale}
          fontSize={0.5}
          color={"white"}
          anchorX={"center"}
          anchorY={"middle"}
        >
          {textLabel}
        </Text>
      ) : (
        <></>
      )}
    </>
  );
}
