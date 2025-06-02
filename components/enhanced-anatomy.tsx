"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface OrganInfo {
  id: string;
  name: string;
  position: { x: number; y: number };
  dotPosition: { x: number; y: number };
}

interface EnhancedAnatomyProps {
  selectedOrgan: string;
  onOrganSelect: (organId: string) => void;
}

const organData: OrganInfo[] = [
  {
    id: "liver",
    name: "Liver",
    position: { x: 85, y: 45 }, // Label position as percentage - moved to right side
    dotPosition: { x: 45, y: 43 }, // Dot position on the liver area
  },
  {
    id: "heart",
    name: "Heart",
    position: { x: 20, y: 25 }, // Label position - left side
    dotPosition: { x: 45, y: 30 }, // Dot position on the heart area
  },
  {
    id: "lungs",
    name: "Lungs",
    position: { x: 75, y: 25 }, // Label position - right side
    dotPosition: { x: 40, y: 25 }, // Dot position on the lungs area
  },
  {
    id: "brain",
    name: "Brain",
    position: { x: 20, y: 8 }, // Label position - top left
    dotPosition: { x: 50, y: 12 }, // Dot position on the brain area
  },
];

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const labelVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
      ease: "easeOut",
    },
  },
};

export default function EnhancedAnatomy({ selectedOrgan, onOrganSelect }: EnhancedAnatomyProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate image loading
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getOrganOpacity = (organId: string) => {
    return selectedOrgan === organId ? 1 : 0.3;
  };

  const getLineColor = (organId: string) => {
    const colors = {
      liver: "#f59e0b", // amber
      heart: "#ef4444", // red
      lungs: "#3b82f6", // blue
      brain: "#8b5cf6", // purple
    };
    return colors[organId as keyof typeof colors] || "#6b7280";
  };

  // Calculate the arrow endpoint on the edge of the label box
  const calculateArrowEndpoint = (organ: OrganInfo) => {
    const { dotPosition, position } = organ;
    
    // Approximate label box dimensions (in percentage units)
    const labelWidth = 8; // approximate width of label box
    const labelHeight = 3; // approximate height of label box
    
    // Calculate the direction from dot to label center
    const dx = position.x - dotPosition.x;
    const dy = position.y - dotPosition.y;
    
    // Calculate which edge the line should connect to
    const absRatioX = Math.abs(dx) / (labelWidth / 2);
    const absRatioY = Math.abs(dy) / (labelHeight / 2);
    
    let endX = position.x;
    let endY = position.y;
    
    if (absRatioX > absRatioY) {
      // Line hits left or right edge
      endX = position.x - Math.sign(dx) * (labelWidth / 2);
      endY = position.y;
    } else {
      // Line hits top or bottom edge
      endX = position.x;
      endY = position.y - Math.sign(dy) * (labelHeight / 2);
    }
    
    return { x: endX, y: endY };
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Background anatomy image */}
      <div className="relative">
        <Image
          src="/liver_light.png"
          alt="Human Anatomy"
          width={400}
          height={500}
          className="w-full h-auto object-contain"
          onLoad={() => setIsLoaded(true)}
        />
        
        {/* Overlay SVG for lines and dots */}
        {isLoaded && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              {organData.map((organ) => (
                <marker
                  key={`arrow-${organ.id}`}
                  id={`arrow-${organ.id}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="3"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path
                    d="M0,0 L0,6 L9,3 z"
                    fill={getLineColor(organ.id)}
                    opacity={getOrganOpacity(organ.id)}
                  />
                </marker>
              ))}
            </defs>
            
            {organData.map((organ) => {
              const arrowEndpoint = calculateArrowEndpoint(organ);
              return (
                <g key={organ.id} opacity={getOrganOpacity(organ.id)}>
                  {/* Connection line */}
                  <motion.path
                    d={`M ${organ.dotPosition.x} ${organ.dotPosition.y} L ${arrowEndpoint.x} ${arrowEndpoint.y}`}
                    stroke={getLineColor(organ.id)}
                    strokeWidth="0.4"
                    fill="none"
                    markerEnd={`url(#arrow-${organ.id})`}
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                    strokeDasharray="none"
                  />
                  
                  {/* Organ dot */}
                  <motion.circle
                    cx={organ.dotPosition.x}
                    cy={organ.dotPosition.y}
                    r="1.2"
                    fill={getLineColor(organ.id)}
                    stroke="white"
                    strokeWidth="0.3"
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => onOrganSelect(organ.id)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.8 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
                  />
                  
                  {/* Pulsing ring for selected organ */}
                  {selectedOrgan === organ.id && (
                    <motion.circle
                      cx={organ.dotPosition.x}
                      cy={organ.dotPosition.y}
                      r="2.5"
                      fill="none"
                      stroke={getLineColor(organ.id)}
                      strokeWidth="0.3"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ 
                        scale: [1, 1.4, 1], 
                        opacity: [0.9, 0.3, 0.9] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}
        
        {/* Organ labels */}
        {isLoaded && organData.map((organ) => (
          <motion.div
            key={`label-${organ.id}`}
            className="absolute pointer-events-auto"
            style={{
              left: `${organ.position.x}%`,
              top: `${organ.position.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: getOrganOpacity(organ.id),
            }}
            variants={labelVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              className={`
                bg-white/98 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg border-2
                cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl
                min-w-[80px] text-center relative
                ${selectedOrgan === organ.id 
                  ? 'border-2 shadow-2xl transform scale-105' 
                  : 'border-white/50'
                }
              `}
              style={{
                borderColor: selectedOrgan === organ.id ? getLineColor(organ.id) : undefined,
                boxShadow: selectedOrgan === organ.id 
                  ? `0 8px 32px ${getLineColor(organ.id)}30, 0 0 0 1px ${getLineColor(organ.id)}20` 
                  : '0 4px 16px rgba(0,0,0,0.1)',
              }}
              onClick={() => onOrganSelect(organ.id)}
            >
              {/* Active indicator dot */}
              {selectedOrgan === organ.id && (
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: getLineColor(organ.id) }}
                />
              )}
              
              <span
                className={`
                  text-sm font-bold transition-colors duration-300 block
                  ${selectedOrgan === organ.id ? 'text-gray-900' : 'text-gray-700'}
                `}
                style={{
                  color: selectedOrgan === organ.id ? getLineColor(organ.id) : undefined,
                }}
              >
                {organ.name}
              </span>
              
              {/* Subtle background gradient for selected organ */}
              {selectedOrgan === organ.id && (
                <div 
                  className="absolute inset-0 rounded-xl opacity-5 pointer-events-none"
                  style={{ backgroundColor: getLineColor(organ.id) }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 