"use client";

import { useState, useRef, useEffect } from "react";
import { Sphere, Html, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";
import { ThreeEvent } from "@react-three/fiber";

interface OrganDotProps {
  position: THREE.Vector3;
  organType: string;
  onClick: () => void;
  isActive: boolean;
  color?: string;
  size?: number;
  pulseRatio?: number;
  segments?: number;
}

// Enhanced dot component with color customization and pulsing effect
export default function OrganDot({ position, organType, onClick, isActive, color = "#ffffff", size = 0.1, pulseRatio = 0.4, segments = 32 }: OrganDotProps) {
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef<THREE.Mesh>(null);
  
  // Use spring animation for smooth transitions
  const { scale, dotOpacity, pulseOpacity } = useSpring({
    scale: hovered ? 1.3 : 1,
    dotOpacity: isActive ? 0.95 : 0.85,
    pulseOpacity: hovered ? pulseRatio : 0,
    config: config.gentle
  });
  
  // Animate pulse effect
  useEffect(() => {
    if (hovered && pulseRef.current) {
      let frame: number;
      const animate = () => {
        if (!pulseRef.current) return;
        
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
        pulseRef.current.scale.set(scale, scale, scale);
        frame = requestAnimationFrame(animate);
      };
      
      frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }
  }, [hovered]);
  
  // Get size based on organ type
  const getDotSize = () => {
    return size;
  };
  
  // Handle click with proper event stopping
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };
  
  // Animated sphere component
  const AnimatedSphere = animated(Sphere);
  
  return (
    <group position={position}>
      {/* Pulsing effect ring when hovered */}
      <Sphere 
        ref={pulseRef}
        args={[getDotSize() * 1.8, segments, segments]}
      >
        <animated.meshBasicMaterial 
          color={color}
          transparent={true}
          opacity={pulseOpacity}
        />
      </Sphere>
      
      {/* Main dot */}
      <AnimatedSphere
        args={[getDotSize(), segments, segments]} 
        onClick={handleClick}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={scale}
      >
        <animated.meshBasicMaterial 
          color={color} 
          transparent={true}
          opacity={dotOpacity}
        />
      </AnimatedSphere>
      
      {/* Outline ring */}
      <Sphere
        args={[getDotSize() * 1.12, segments, segments]}
      >
        <meshBasicMaterial 
          color="#ffffff"
          transparent={true}
          opacity={0.7}
        />
      </Sphere>
      
      {/* Tooltip on hover */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {hovered && (
          <Html position={[0, getDotSize() * 4, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="bg-white/95 px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 shadow-md whitespace-nowrap border border-gray-100 transform transition-all duration-200 ease-in-out">
              {organType.charAt(0).toUpperCase() + organType.slice(1)}
            </div>
          </Html>
        )}
      </Billboard>
    </group>
  );
} 