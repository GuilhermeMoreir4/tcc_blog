"use client";
import { useState, MouseEvent } from "react";

interface Props {
  children: React.ReactNode;
}

export function GridBackground({ children }: Props) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });


  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative min-h-screen w-full bg-eerie overflow-hidden group"
      onMouseMove={handleMouseMove}
    >

      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div
        className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none transition-opacity duration-300"
        style={{
          maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
        }}
      />

      
      <div className="relative z-10">{children}</div>
    </div>
  );
}
