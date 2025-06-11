"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useThree, ThreeEvent } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import OrganDot from "./organ-dot";

interface ModelProps {
  onOrganClick: (organType: string, position: THREE.Vector3) => void;
  setOrganPositions?: (positions: Record<string, THREE.Vector3>) => void;
}

interface CameraControllerProps {
  focusPosition: THREE.Vector3 | null;
  isFocusing: boolean;
}

// Define organ data structure
interface OrganInfo {
  name: string;
  description: string;
  position: THREE.Vector3;
  color: string;
  details?: {
    function?: string;
    size?: string;
    facts?: string[];
  };
}

function Model({ onOrganClick, setOrganPositions }: ModelProps) {
  const gltf = useLoader(GLTFLoader, "/3d.glb");
  const modelRef = useRef<THREE.Group>(null);
  const [highlightedMesh, setHighlightedMesh] = useState<THREE.Mesh | null>(null);
  const { camera } = useThree();
  
  // Original material map to restore after highlighting
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  
  // Setup organ meshes for interactivity
  useEffect(() => {
    if (gltf.scene && modelRef.current) {
      // Keep model interactive but don't try to detect organs automatically
      gltf.scene.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          // Make meshes interactive
          mesh.userData.isOrgan = true;
          mesh.userData.clickable = true;
          
          // Store original materials for later restoration
          originalMaterials.current.set(mesh, mesh.material);
        }
      });
    }
  }, [gltf.scene]);
  
  // Function to highlight a mesh
  const highlightOrgan = (mesh: THREE.Mesh, color: string) => {
    // Save original material if not already saved
    if (!originalMaterials.current.has(mesh)) {
      originalMaterials.current.set(mesh, mesh.material);
    }
    
    // Create highlight material
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.95,
    });
    
    // Apply highlight material
    mesh.material = highlightMaterial;
    setHighlightedMesh(mesh);
  };
  
  // Function to reset highlight
  const resetHighlight = () => {
    if (highlightedMesh && originalMaterials.current.has(highlightedMesh)) {
      highlightedMesh.material = originalMaterials.current.get(highlightedMesh) as THREE.Material | THREE.Material[];
      setHighlightedMesh(null);
    }
  };
  
  // Handle click event on the model
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Prevent event propagation
    event.stopPropagation();
    
    // If we clicked on an organ mesh
    if (event.object && event.object.userData && event.object.userData.isOrgan) {
      // Get the world position of the clicked point for more accuracy
      const worldPosition = event.point.clone();
      
      // Call the callback with the organ type and exact clicked position
      onOrganClick(event.object.userData.organType || 'other', worldPosition);
      
      // Highlight the clicked mesh with a subtle glow
      if (event.object instanceof THREE.Mesh) {
        // Reset any previously highlighted mesh
        resetHighlight();
        
        // Highlight the clicked mesh
        highlightOrgan(event.object, '#ffffff');
      }
    }
  };

  // Reset highlight when component unmounts
  useEffect(() => {
    return () => {
      resetHighlight();
    };
  }, []);

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      scale={0.02} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      onClick={handleClick}
    />
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-blue-500 font-medium">
        Loading 3D model... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function CameraController({ focusPosition, isFocusing }: CameraControllerProps) {
  const { camera } = useThree();
  // Using any for the ref type to avoid complex typing issues with OrbitControls
  const controlsRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  
  // Function to cancel any ongoing animation
  const cancelAnimation = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  // Update camera position when focusPosition changes
  useEffect(() => {
    // Cancel any existing animation when dependencies change
    cancelAnimation();
    
    if (isFocusing && focusPosition) {
      // Camera position exactly in front of the dot, maintaining the same x coordinate
      // and only modifying the z-distance for proper viewing
      const targetPosition = new THREE.Vector3(
        focusPosition.x,                 // Keep the exact x position of the dot
        focusPosition.y,                 // Keep the exact y position of the dot
        focusPosition.z + 3              // Position camera directly in front at a fixed distance
      );
      
      // Look directly at the dot position
      const lookAtPosition = new THREE.Vector3(
        focusPosition.x,                 // Target exactly at dot's x position
        focusPosition.y,                 // Target exactly at dot's y position
        focusPosition.z                  // Target exactly at dot's z position
      );
      
      // Animate camera movement with spring physics for more natural motion
      let t = 0;
      const duration = 800; // Shorter for more direct movement
      const startPosition = camera.position.clone();
      const startTime = Date.now();
      
      // Store the initial camera target for smooth transition
      const startLookAt = new THREE.Vector3(0, 0, 0);
      camera.getWorldDirection(startLookAt);
      startLookAt.add(camera.position);
      
      const animateCamera = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed < duration) {
          // Use a cubic ease-in-out function for smoother motion
          t = elapsed / duration;
          const easedT = t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Interpolate camera position along a straight line
          camera.position.lerpVectors(startPosition, targetPosition, easedT);
          
          // Interpolate camera target to look exactly at the dot
          const currentLookAt = new THREE.Vector3();
          currentLookAt.lerpVectors(startLookAt, lookAtPosition, easedT);
          camera.lookAt(currentLookAt);
          
          // Continue animation
          animationRef.current = requestAnimationFrame(animateCamera);
        } else {
          // Final position and orientation - ensure precise alignment
          camera.position.copy(targetPosition);
          camera.lookAt(lookAtPosition);
          
          // Clear animation reference
          animationRef.current = null;
        }
      };
      
      // Start animation
      animationRef.current = requestAnimationFrame(animateCamera);
      
      // Disable controls during animation
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else if (!isFocusing) {
      // Reset camera to original position when leaving focus mode - straight back movement
      const resetPosition = new THREE.Vector3(0, 0, 10);
      const resetTarget = new THREE.Vector3(0, -1, 0); 
      
      // Animate camera back to original position with spring physics
      let t = 0;
      const duration = 800; // Shorter for more direct movement
      const startPosition = camera.position.clone();
      const startTime = Date.now();
      
      // Store the initial camera target for smooth transition
      const startLookAt = new THREE.Vector3(0, 0, 0);
      camera.getWorldDirection(startLookAt);
      startLookAt.add(camera.position);
      
      const animateCamera = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed < duration) {
          // Use a cubic ease-in-out function for smoother motion
          t = elapsed / duration;
          const easedT = t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Interpolate camera position
          camera.position.lerpVectors(startPosition, resetPosition, easedT);
          
          // Interpolate camera target
          const currentLookAt = new THREE.Vector3();
          currentLookAt.lerpVectors(startLookAt, resetTarget, easedT);
          camera.lookAt(currentLookAt);
          
          // Continue animation
          animationRef.current = requestAnimationFrame(animateCamera);
        } else {
          // Final position and orientation
          camera.position.copy(resetPosition);
          camera.lookAt(resetTarget);
          
          // Clear animation reference
          animationRef.current = null;
          
          // Re-enable controls after animation completes
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        }
      };
      
      // Start animation
      animationRef.current = requestAnimationFrame(animateCamera);
    }
    
    // Cleanup function to cancel animation on unmount or when dependencies change
    return cancelAnimation;
  }, [camera, focusPosition, isFocusing]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
    />
  );
}

export default function LungsModel() {
  const [error, setError] = useState<string | null>(null);
  const [focusOrgan, setFocusOrgan] = useState<string | null>(null);
  const [focusPosition, setFocusPosition] = useState<THREE.Vector3 | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Define detailed organ information
  const organData: Record<string, OrganInfo> = {
    'heart': {
      name: 'Heart',
      description: 'The heart is a muscular organ that pumps blood through the blood vessels of the circulatory system.',
      position: new THREE.Vector3(0, 2, 2.2),
      color: '#f87171', // red
      details: {
        function: 'Pumps blood throughout the body, supplying oxygen and nutrients to tissues and removing carbon dioxide and other wastes.',
        size: 'About the size of a closed fist, weighing 250-350 grams.',
        facts: [
          'Beats about 100,000 times per day (about 3 billion beats in a lifetime).',
          'Pumps about 2,000 gallons of blood every day.',
          'The heartbeat sound is caused by the valves of the heart opening and closing.'
"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useThree, ThreeEvent } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import OrganDot from "./organ-dot";

interface ModelProps {
  onOrganClick: (organType: string, position: THREE.Vector3) => void;
  setOrganPositions?: (positions: Record<string, THREE.Vector3>) => void;
}

interface CameraControllerProps {
  focusPosition: THREE.Vector3 | null;
  isFocusing: boolean;
}

// Define organ data structure
interface OrganInfo {
  name: string;
  description: string;
  position: THREE.Vector3;
  color: string;
  details?: {
    function?: string;
    size?: string;
    facts?: string[];
  };
}

function Model({ onOrganClick, setOrganPositions }: ModelProps) {
  const gltf = useLoader(GLTFLoader, "/3d.glb");
  const modelRef = useRef<THREE.Group>(null);
  const [highlightedMesh, setHighlightedMesh] = useState<THREE.Mesh | null>(null);
  const { camera } = useThree();
  
  // Original material map to restore after highlighting
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  
  // Setup organ meshes for interactivity
  useEffect(() => {
    if (gltf.scene && modelRef.current) {
      // Keep model interactive but don't try to detect organs automatically
      gltf.scene.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh;
          // Make meshes interactive
          mesh.userData.isOrgan = true;
          mesh.userData.clickable = true;
          
          // Store original materials for later restoration
          originalMaterials.current.set(mesh, mesh.material);
        }
      });
    }
  }, [gltf.scene]);
  
  // Function to highlight a mesh
  const highlightOrgan = (mesh: THREE.Mesh, color: string) => {
    // Save original material if not already saved
    if (!originalMaterials.current.has(mesh)) {
      originalMaterials.current.set(mesh, mesh.material);
    }
    
    // Create highlight material
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.95,
    });
    
    // Apply highlight material
    mesh.material = highlightMaterial;
    setHighlightedMesh(mesh);
  };
  
  // Function to reset highlight
  const resetHighlight = () => {
    if (highlightedMesh && originalMaterials.current.has(highlightedMesh)) {
      highlightedMesh.material = originalMaterials.current.get(highlightedMesh) as THREE.Material | THREE.Material[];
      setHighlightedMesh(null);
    }
  };
  
  // Handle click event on the model
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Prevent event propagation
    event.stopPropagation();
    
    // If we clicked on an organ mesh
    if (event.object && event.object.userData && event.object.userData.isOrgan) {
      // Get the world position of the clicked point for more accuracy
      const worldPosition = event.point.clone();
      
      // Call the callback with the organ type and exact clicked position
      onOrganClick(event.object.userData.organType || 'other', worldPosition);
      
      // Highlight the clicked mesh with a subtle glow
      if (event.object instanceof THREE.Mesh) {
        // Reset any previously highlighted mesh
        resetHighlight();
        
        // Highlight the clicked mesh
        highlightOrgan(event.object, '#ffffff');
      }
    }
  };

  // Reset highlight when component unmounts
  useEffect(() => {
    return () => {
      resetHighlight();
    };
  }, []);

  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      scale={0.02} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      onClick={handleClick}
    />
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-blue-500 font-medium">
        Loading 3D model... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function CameraController({ focusPosition, isFocusing }: CameraControllerProps) {
  const { camera } = useThree();
  // Using any for the ref type to avoid complex typing issues with OrbitControls
  const controlsRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  
  // Function to cancel any ongoing animation
  const cancelAnimation = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  // Update camera position when focusPosition changes
  useEffect(() => {
    // Cancel any existing animation when dependencies change
    cancelAnimation();
    
    if (isFocusing && focusPosition) {
      // Camera position exactly in front of the dot, maintaining the same x coordinate
      // and only modifying the z-distance for proper viewing
      const targetPosition = new THREE.Vector3(
        focusPosition.x,                 // Keep the exact x position of the dot
        focusPosition.y,                 // Keep the exact y position of the dot
        focusPosition.z + 3              // Position camera directly in front at a fixed distance
      );
      
      // Look directly at the dot position
      const lookAtPosition = new THREE.Vector3(
        focusPosition.x,                 // Target exactly at dot's x position
        focusPosition.y,                 // Target exactly at dot's y position
        focusPosition.z                  // Target exactly at dot's z position
      );
      
      // Animate camera movement with spring physics for more natural motion
      let t = 0;
      const duration = 800; // Shorter for more direct movement
      const startPosition = camera.position.clone();
      const startTime = Date.now();
      
      // Store the initial camera target for smooth transition
      const startLookAt = new THREE.Vector3(0, 0, 0);
      camera.getWorldDirection(startLookAt);
      startLookAt.add(camera.position);
      
      const animateCamera = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed < duration) {
          // Use a cubic ease-in-out function for smoother motion
          t = elapsed / duration;
          const easedT = t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Interpolate camera position along a straight line
          camera.position.lerpVectors(startPosition, targetPosition, easedT);
          
          // Interpolate camera target to look exactly at the dot
          const currentLookAt = new THREE.Vector3();
          currentLookAt.lerpVectors(startLookAt, lookAtPosition, easedT);
          camera.lookAt(currentLookAt);
          
          // Continue animation
          animationRef.current = requestAnimationFrame(animateCamera);
        } else {
          // Final position and orientation - ensure precise alignment
          camera.position.copy(targetPosition);
          camera.lookAt(lookAtPosition);
          
          // Clear animation reference
          animationRef.current = null;
        }
      };
      
      // Start animation
      animationRef.current = requestAnimationFrame(animateCamera);
      
      // Disable controls during animation
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else if (!isFocusing) {
      // Reset camera to original position when leaving focus mode - straight back movement
      const resetPosition = new THREE.Vector3(0, 0, 10);
      const resetTarget = new THREE.Vector3(0, -1, 0); 
      
      // Animate camera back to original position with spring physics
      let t = 0;
      const duration = 800; // Shorter for more direct movement
      const startPosition = camera.position.clone();
      const startTime = Date.now();
      
      // Store the initial camera target for smooth transition
      const startLookAt = new THREE.Vector3(0, 0, 0);
      camera.getWorldDirection(startLookAt);
      startLookAt.add(camera.position);
      
      const animateCamera = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed < duration) {
          // Use a cubic ease-in-out function for smoother motion
          t = elapsed / duration;
          const easedT = t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Interpolate camera position
          camera.position.lerpVectors(startPosition, resetPosition, easedT);
          
          // Interpolate camera target
          const currentLookAt = new THREE.Vector3();
          currentLookAt.lerpVectors(startLookAt, resetTarget, easedT);
          camera.lookAt(currentLookAt);
          
          // Continue animation
          animationRef.current = requestAnimationFrame(animateCamera);
        } else {
          // Final position and orientation
          camera.position.copy(resetPosition);
          camera.lookAt(resetTarget);
          
          // Clear animation reference
          animationRef.current = null;
          
          // Re-enable controls after animation completes
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        }
      };
      
      // Start animation
      animationRef.current = requestAnimationFrame(animateCamera);
    }
    
    // Cleanup function to cancel animation on unmount or when dependencies change
    return cancelAnimation;
  }, [camera, focusPosition, isFocusing]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
    />
  );
}

export default function LungsModel() {
  const [error, setError] = useState<string | null>(null);
  const [focusOrgan, setFocusOrgan] = useState<string | null>(null);
  const [focusPosition, setFocusPosition] = useState<THREE.Vector3 | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  
  // Define detailed organ information
  const organData: Record<string, OrganInfo> = {
    'heart': {
      name: 'Heart',
      description: 'The heart is a muscular organ that pumps blood through the blood vessels of the circulatory system.',
      position: new THREE.Vector3(0, 2, 2.2),
      color: '#f87171' // red
    },
    'liver': {
      name: 'Liver',
      description: 'The liver is a vital organ that processes nutrients, filters the blood, and fights infections.',
      position: new THREE.Vector3(-0.5, 1.25, 2.2),
      color: '#a16207' // brown
    },
    'stomach': {
      name: 'Stomach',
      description: 'The stomach is a muscular organ that digests food and produces acid to kill bacteria.',
      position: new THREE.Vector3(0.5, 1.1, 2.2),
      color: '#818cf8' // indigo
    },
    'small intestine': {
      name: 'Small Intestine',
      description: 'The small intestine absorbs most of the nutrients from the food we eat.',
      position: new THREE.Vector3(0.05, 0, 2.2),
      color: '#fb923c' // orange
    }
  };
  
  // Initialize organPositions from organData
  const organPositions = Object.entries(organData).reduce((acc, [key, data]) => {
    acc[key] = data.position;
    return acc;
  }, {} as Record<string, THREE.Vector3>);
  
  // Handler for organ click events
  const handleOrganClick = (organType: string, position: THREE.Vector3) => {
    if (organType !== 'other') {
      setFocusOrgan(organType);
      
      // Use the organPositions directly for more accuracy
      // This ensures we zoom to the exact position where the dot is located
      setFocusPosition(new THREE.Vector3().copy(organPositions[organType]));
      
      // Show info panel after a short delay to allow camera animation
      setTimeout(() => {
        setShowInfoPanel(true);
      }, 300);
    }
  };
  
  // Reset focus to show full model
  const resetFocus = () => {
    setShowInfoPanel(false);
    // Small delay before resetting focus to allow info panel to fade out
    setTimeout(() => {
      setFocusOrgan(null);
      setFocusPosition(null);
    }, 200);
  };
  
  // Function to switch between organs directly
  const switchToOrgan = (organType: string) => {
    if (organType === focusOrgan) return;
    
    setShowInfoPanel(false);
    
    // Small delay before changing focus
    setTimeout(() => {
      setFocusOrgan(organType);
      setFocusPosition(new THREE.Vector3().copy(organPositions[organType]));
      
      // Show new info panel after transition
      setTimeout(() => {
        setShowInfoPanel(true);
      }, 300);
    }, 200);
  };

  return (
    <div className="relative w-full h-[500px]">
      <div className="absolute w-full h-full rounded-full bg-gradient-to-b from-blue-50 to-transparent opacity-30 z-0"></div>
      
      {/* Organ navigation menu */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        {Object.entries(organData).map(([organType, data]) => (
          <button 
            key={organType}
            onClick={() => focusOrgan ? switchToOrgan(organType) : handleOrganClick(organType, organPositions[organType])}
            className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm transition-all duration-200 flex items-center ${
              focusOrgan === organType 
                ? 'bg-white border-l-4 pl-2' 
                : 'bg-white/90 hover:bg-white'
            }`}
            style={{ borderLeftColor: focusOrgan === organType ? data.color : 'transparent' }}
          >
            <span 
              className="w-2 h-2 rounded-full mr-2" 
              style={{ backgroundColor: data.color }}
            ></span>
            {data.name}
          </button>
        ))}
      </div>
      
      {/* If focused on an organ, show reset button */}
      {focusOrgan && (
        <button 
          onClick={resetFocus}
          className="absolute top-4 right-4 z-10 bg-white text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
        >
          View Full Model
        </button>
      )}
      
      {error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error loading 3D model: {error}</div>
        </div>
      ) : (
        <Canvas
          shadows
          camera={{ position: [0, 0, 10], fov: 40 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0xffffff), 0);
          }}
          onError={(e: any) => setError(e?.message || "Failed to load model")}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          
          <Suspense fallback={<Loader />}>
            <group position={[0, -1, 0]}>
              <Model 
                onOrganClick={handleOrganClick} 
                setOrganPositions={() => {}}
              />
              
              {/* Only render dots when not in focused mode */}
              {!focusOrgan && (
                <group position={[0, 0, 0]}>
                  {Object.entries(organData).map(([organType, data]) => (
                    <OrganDot 
                      key={organType}
                      position={data.position}
                      organType={organType}
                      onClick={() => handleOrganClick(organType, data.position)}
                      isActive={false}
                      color={data.color}
                    />
                  ))}
                </group>
              )}
            </group>
          </Suspense>
          
          <CameraController 
            focusPosition={focusPosition} 
            isFocusing={!!focusOrgan} 
          />
        </Canvas>
      )}
    </div>
  );
} 