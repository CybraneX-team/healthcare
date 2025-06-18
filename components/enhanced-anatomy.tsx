"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface OrganInfo {
  id: string;
  name: string;
  position: { x: number; y: number };
  dotPosition: { x: number; y: number };
  imagePath: string;
}

interface EnhancedAnatomyProps {
  selectedOrgan: string;
  onOrganSelect: (organId: string) => void;
}

const organData: OrganInfo[] = [
  {
    id: "liver",
    name: "Liver",
    position: { x: 85, y: 45 },
    dotPosition: { x: 45, y: 40 },
    imagePath: "/liver_light.png",
  },
  {
    id: "heart",
    name: "Heart",
    position: { x: 0, y: 25 },
    dotPosition: { x: 50, y: 35 },
    imagePath: "/heart_light.png",
  },
  {
    id: "lungs",
    name: "Lungs",
    position: { x: 80, y: 30 },
    dotPosition: { x: 57, y: 32 },
    imagePath: "/lungs_light.png",
  },
  {
    id: "brain",
    name: "Brain",
    position: { x: 20, y: 8 },
    dotPosition: { x: 50, y: 15 },
    imagePath: "/brain_light.png",
  },
  {
    id: "kidney",
    name: "Kidney",
    position: { x: -10, y: 50 },
    dotPosition: { x: 42, y: 45 },
    imagePath: "/kidney_light.png",
  },
  {
    id: "reproductive",
    name: "Reproductive",
    position: { x: 80, y: 65 },
    dotPosition: { x: 48, y: 65 },
    imagePath: "/heart_light.png",
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
  const [isLoaded, setIsLoaded] = useState(true);
  const [currentImagePath, setCurrentImagePath] = useState("/liver_light.png");

  useEffect(() => {
    const selectedOrganData = organData.find((organ) => organ.id === selectedOrgan);
    if (selectedOrganData) {
      setCurrentImagePath(selectedOrganData.imagePath);
    }
  }, [selectedOrgan]);

  useEffect(() => {
    const preloadImages = () => {
      organData.forEach((organ) => {
        const img = document.createElement("img");
        img.src = organ.imagePath;
      });
    };
    preloadImages();
    setIsLoaded(true);
  }, []);

  const getOrganOpacity = (organId: string) => {
    return selectedOrgan === organId ? 1 : 0.3;
  };

  const getLineColor = (organId: string) => {
    const colors = {
      liver: "#f59e0b",
      heart: "#ef4444",
      lungs: "#3b82f6",
      brain: "#8b5cf6",
      kidney: "#8b5cf6",
      reproductive: "#ec4899",
    };
    return colors[organId as keyof typeof colors] || "#6b7280";
  };

  const calculateArrowEndpoint = (organ: OrganInfo) => {
    const { position } = organ;
    return { x: position.x, y: position.y };
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative w-full" style={{ height: "750px" }}>
        {/* Image Container for Crossfade */}
        <div className="absolute inset-0 flex items-start justify-center pt-2">
          {organData.map((organ) => (
            <motion.div
              key={organ.imagePath}
              className="absolute inset-0 flex items-start justify-center pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: currentImagePath === organ.imagePath ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Image
                src={organ.imagePath}
                alt={organ.name}
                width={550}
                height={700}
                className="object-contain"
                style={{ width: "550px", height: "700px", objectFit: "contain" }}
                onLoad={() => setIsLoaded(true)}
                priority
              />
            </motion.div>
          ))}
        </div>

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
                  viewBox="0 0 12 12"
                  refX="11"
                  refY="6"
                  markerWidth="10"
                  markerHeight="10"
                  orient="auto"
                >
                  <path
                    d="M2,2 L2,10 L10,6 z"
                    fill={getLineColor(organ.id)}
                    opacity={getOrganOpacity(organ.id)}
                  />
                </marker>
              ))}
            </defs>

            {organData.map((organ) => {
              const arrowEndpoint = calculateArrowEndpoint(organ);
              const dx = arrowEndpoint.x - organ.dotPosition.x;
              const dy = arrowEndpoint.y - organ.dotPosition.y;
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

              return (
                <g key={organ.id} opacity={getOrganOpacity(organ.id)}>
                  <motion.path
                    d={`M ${organ.dotPosition.x} ${organ.dotPosition.y} L ${arrowEndpoint.x} ${arrowEndpoint.y}`}
                    stroke={getLineColor(organ.id)}
                    strokeWidth="0.5"
                    fill="none"
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                    strokeDasharray="none"
                  />
                  <motion.polygon
                    points={`${arrowEndpoint.x - 1.5},${arrowEndpoint.y - 0.8} ${arrowEndpoint.x - 1.5},${arrowEndpoint.y + 0.8} ${arrowEndpoint.x},${arrowEndpoint.y}`}
                    fill={getLineColor(organ.id)}
                    transform={`rotate(${angle} ${arrowEndpoint.x} ${arrowEndpoint.y})`}
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                  />
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
                    style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.3))" }}
                  />
                  {selectedOrgan === organ.id && (
                    <motion.circle
                      cx={organ.dotPosition.x}
                      cy={organ.dotPosition.y}
                      r="2.5"
                      fill="none"
                      stroke={getLineColor(organ.id)}
                      strokeWidth="0.2"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.9, 0.3, 0.9],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Organ labels */}
        {isLoaded &&
          organData.map((organ) => (
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
                bg-white/98 backdrop-blur-md rounded-xl px-3 py-2 shadow-sm border-1
                cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl
                min-w-[50px] text-center relative
                ${selectedOrgan === organ.id ? "border-2 shadow-2xl transform scale-105" : "border-white/50"}
              `}
                style={{
                  borderColor: selectedOrgan === organ.id ? getLineColor(organ.id) : undefined,
                  boxShadow: selectedOrgan === organ.id
                    ? `0 8px 32px ${getLineColor(organ.id)}30, 0 0 0 1px ${getLineColor(organ.id)}20`
                    : "0 4px 16px rgba(0,0,0,0.1)",
                }}
                onClick={() => onOrganSelect(organ.id)}
              >
                {selectedOrgan === organ.id && (
                  <div
                    className="absolute -top-1 -right-1 w-2 h2 rounded-full animate-pulse"
                    style={{ backgroundColor: getLineColor(organ.id) }}
                  />
                )}
                <span
                  className={`
                  text-xs font-medium transition-colors duration-300 block
                  ${selectedOrgan === organ.id ? "text-gray-900" : "text-gray-700"}
                `}
                  style={{
                    color: selectedOrgan === organ.id ? getLineColor(organ.id) : undefined,
                  }}
                >
                  {organ.name}
                </span>
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