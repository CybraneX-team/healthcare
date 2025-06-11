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
  dotStyle?: {
    size?: number;
    pulseRatio?: number;
    segments?: number;
  };
  details?: {
    function?: string;
    size?: string;
    facts?: string[];
  };
}

function Model({ onOrganClick, setOrganPositions }: ModelProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gltf, setGltf] = useState<any>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  // Load the model with error handling
  useEffect(() => {
    const loader = new GLTFLoader();
    
    console.log("Starting to load 3D model...");
    
    loader.load(
      "/3d.glb",
      (loadedGltf) => {
        console.log("3D model loaded successfully:", loadedGltf);
        setGltf(loadedGltf);
        setLoading(false);
        
        // Log model bounds for debugging
        const box = new THREE.Box3().setFromObject(loadedGltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        console.log("Model size:", size);
        console.log("Model center:", center);
        console.log("Model bounds:", box);
      },
      (progress) => {
        console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%");
      },
      (error) => {
        console.error("Error loading 3D model:", error);
        setError(error.message || "Failed to load model");
        setLoading(false);
      }
    );
  }, []);
  
  // Setup organ meshes for interactivity
  useEffect(() => {
    if (gltf?.scene && modelRef.current) {
      console.log("Setting up model interactivity...");
      // Keep model interactive but don't try to detect organs automatically
      gltf.scene.traverse((node: any) => {
        if (node.isMesh) {
          const mesh = node as THREE.Mesh;
          // Make meshes interactive
          mesh.userData.isOrgan = true;
          mesh.userData.clickable = true;
          
          // Add some basic material if none exists
          if (!mesh.material) {
            mesh.material = new THREE.MeshStandardMaterial({ color: 0x888888 });
          }
        }
      });
    }
  }, [gltf]);
  
  // Handle click event on the model
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    console.log("Model clicked:", event);
    // Prevent event propagation
    event.stopPropagation();
    
    // If we clicked on an organ mesh
    if (event.object && event.object.userData && event.object.userData.isOrgan) {
      // Get the world position of the clicked point for more accuracy
      const worldPosition = event.point.clone();
      
      // Call the callback with the organ type and exact clicked position
      onOrganClick(event.object.userData.organType || 'other', worldPosition);
    }
  };

  if (loading) {
    return (
      <Html center>
        <div className="text-blue-500 font-medium">
          Loading 3D model...
        </div>
      </Html>
    );
  }

  if (error) {
    return (
      <Html center>
        <div className="text-red-500 font-medium">
          Error: {error}
        </div>
      </Html>
    );
  }

  if (!gltf) {
    return (
      <Html center>
        <div className="text-yellow-500 font-medium">
          No model loaded
        </div>
      </Html>
    );
  }

  return (
    <group>
      {/* Test geometry to verify rendering */}
      <mesh position={[2, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      <primitive 
        ref={modelRef}
        object={gltf.scene} 
        scale={0.1} 
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        onClick={handleClick}
      />
    </group>
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

interface CameraControllerProps {
  focusPosition: THREE.Vector3 | null;
  isFocusing: boolean;
  xOffset?: number; // Optional x-axis offset
  yOffset?: number; // Optional y-axis offset
}

function CameraController({ 
  focusPosition, 
  isFocusing, 
  xOffset = 0.5, // Default x offset
  yOffset = -1  // Default y offset
}: CameraControllerProps) {
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
      // Use the props for offsets to control camera position
      // Camera position with intentional offset on x and y axis
      const targetPosition = new THREE.Vector3(
        focusPosition.x + xOffset, // Shift camera position on x-axis
        focusPosition.y + yOffset, // Shift camera position on y-axis
        focusPosition.z + 2.5       // Position camera at a fixed distance
      );
      
      // Still look directly at the dot position
      const lookAtPosition = new THREE.Vector3(
        focusPosition.x,           // Target exactly at dot's x position
        focusPosition.y,           // Target exactly at dot's y position
        focusPosition.z            // Target exactly at dot's z position
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
  const [expandedInfo, setExpandedInfo] = useState(false);
  // Add camera offset state values
  const [cameraXOffset, setCameraXOffset] = useState(0.5);
  const [cameraYOffset, setCameraYOffset] = useState(0.2);
  
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
        ]
      }
    },
    'liver': {
      name: 'Liver',
      description: 'The liver is a vital organ that processes nutrients, filters the blood, and fights infections.',
      position: new THREE.Vector3(-0.5, 1.25, 2.2),
      color: '#a16207', // brown
      details: {
        function: 'Filters blood, detoxifies chemicals, metabolizes drugs, produces proteins important for blood clotting and other functions.',
        size: 'Largest internal organ, weighing about 1.5 kg in adults.',
        facts: [
          'Can regenerate itself after damage.',
          'Performs over 500 different functions.',
          'Produces bile which helps digest fats.'
        ]
      }
    },
    'stomach': {
      name: 'Stomach',
      description: 'The stomach is a muscular organ that digests food and produces acid to kill bacteria.',
      position: new THREE.Vector3(0.5, 1.1, 2.2),
      color: '#818cf8', // indigo
      details: {
        function: 'Stores food, mixes it with digestive enzymes, and begins the digestion of proteins.',
        size: 'When empty, about the size of a fist, but can expand to hold up to 4 liters.',
        facts: [
          'Produces hydrochloric acid that is strong enough to dissolve metal.',
          'The inner lining completely renews itself every 3-4 days.',
          'Growling sounds occur when muscles contract to move food and air through the digestive system.'
        ]
      }
    },
    'small intestine': {
      name: 'Small Intestine',
      description: 'The small intestine absorbs most of the nutrients from the food we eat.',
      position: new THREE.Vector3(0.05, -0.1, 2.2),
      color: '#fb923c', // orange
      details: {
        function: 'Primary site of nutrient absorption, including carbohydrates, proteins, fats, vitamins, and minerals.',
        size: 'About 20 feet (6 meters) long but only 1 inch in diameter.',
        facts: [
          'Has a surface area of about 2,700 square feet (250 square meters) due to tiny finger-like projections called villi.',
          'Food passes through in 3-5 hours.',
          'Produces hormones that stimulate insulin release.'
        ]
      }
    }
  };
  
  // Initialize organPositions from organData
  const organPositions = Object.entries(organData).reduce((acc, [key, data]) => {
    acc[key] = data.position;
    return acc;
  }, {} as Record<string, THREE.Vector3>);
  
  // Handler for organ click events from any source (dot or model)
  const handleOrganClick = (organType: string, position: THREE.Vector3) => {
    if (organType !== 'other') {
      setFocusOrgan(organType);
      
      // Use the predefined organ position for exact dot position
      const exactDotPosition = organPositions[organType].clone();
      setFocusPosition(exactDotPosition);
      
      // Show info panel after a short delay to allow camera animation
      setTimeout(() => {
        setShowInfoPanel(true);
      }, 300);
    }
  };
  
  // Handler specifically for clicking on the organ dots
  const handleDotClick = (organType: string) => {
    // Always use the exact position from our organData
    const exactPosition = organData[organType].position.clone();
    setFocusOrgan(organType);
    setFocusPosition(exactPosition);
    
    // Show info panel after a short delay to allow camera animation
    setTimeout(() => {
      setShowInfoPanel(true);
    }, 300);
  };
  
  // Reset focus to show full model
  const resetFocus = () => {
    setShowInfoPanel(false);
    setExpandedInfo(false);
    
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
    setExpandedInfo(false);
    
    // Small delay before changing focus
    setTimeout(() => {
      setFocusOrgan(organType);
      // Use exact dot position from our organ data
      const exactPosition = organData[organType].position.clone();
      setFocusPosition(exactPosition);
      
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
            onClick={() => focusOrgan ? switchToOrgan(organType) : handleDotClick(organType)}
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
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button 
            onClick={resetFocus}
            className="bg-white text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
          >
            View Full Model
          </button>
          
          {/* Camera offset controls */}
          {/* <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Camera Adjustments</h4>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Horizontal Shift</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={cameraXOffset}
                  onChange={(e) => setCameraXOffset(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600 block mb-1">Vertical Shift</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={cameraYOffset}
                  onChange={(e) => setCameraYOffset(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div> */}
        </div>
      )}
      
      {error ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-red-500">Error loading 3D model: {error}</div>
        </div>
      ) : (
        <Canvas
          shadows
          camera={{ position: [0, 0, 15], fov: 50 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor(new THREE.Color(0xf0f8ff), 1);
            console.log("Canvas created, scene:", scene);
          }}
          onError={(e: any) => setError(e?.message || "Failed to load model")}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-10, 5, -5]} intensity={0.8} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />
          
          <Suspense fallback={<Loader />}>
            <group position={[0, -1, 0]}>
              <Model 
                onOrganClick={handleOrganClick} 
                setOrganPositions={() => {}}
              />
              
              {/* Only render dots when not in focused mode */}
              {!focusOrgan && (
                <group position={[0, 0, 0]}>
                  {Object.entries(organData).map(([organType, data]) => {
                    // Define custom dot styles based on organ type
                    let dotSize = 0.1;
                    let pulseFactor = 0.4;
                    let segments = 24;
                    
                    // Custom sizes for each organ
                    if (organType === 'heart') {
                      dotSize = 0.14;
                      pulseFactor = 0.5;
                      segments = 32;
                    } else if (organType === 'liver') {
                      dotSize = 0.20;
                      pulseFactor = 0.25;
                      segments = 24;
                    } else if (organType === 'stomach') {
                      dotSize = 0.15;
                      pulseFactor = 0.20;
                      segments = 20;
                    } else if (organType === 'small intestine') {
                      dotSize = 0.25;
                      pulseFactor = 0.2;
                      segments = 32;
                    }
                    
                    return (
                      <OrganDot 
                        key={organType}
                        position={data.position}
                        organType={organType}
                        onClick={() => handleDotClick(organType)}
                        isActive={false}
                        color={data.color}
                        size={dotSize}
                        pulseRatio={pulseFactor}
                        segments={segments}
                      />
                    );
                  })}
                </group>
              )}
            </group>
          </Suspense>
          
          <CameraController 
            focusPosition={focusPosition} 
            isFocusing={!!focusOrgan}
            xOffset={cameraXOffset} // Use state value for dynamic control
            yOffset={cameraYOffset} // Use state value for dynamic control
          />
        </Canvas>
      )}
    </div>
  );
}