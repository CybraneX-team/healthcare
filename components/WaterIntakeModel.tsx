"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface WaterIntakeModelProps {
  waterLevel: number; // 0-100
}

const WaterIntakeModel: React.FC<WaterIntakeModelProps> = ({ waterLevel }) => {
  const level = Math.max(0, Math.min(100, waterLevel));

  return (
    <div className="relative w-full max-w-xs mx-auto" style={{ height: '500px' }}>
      {/* Water fill layer with body mask */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: '300px', height: '400px' }}>
          {/* Water fill with SVG mask applied to the container */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              width: '300px',
              height: '400px',
              maskImage: 'url(/human_body_mask.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/human_body_mask.svg)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
            }}
          >
            {/* Water fill animation */}
            <motion.div
              className="absolute left-0 bottom-0 w-full"
              initial={{ height: '0%' }}
              animate={{ height: `${level}%` }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              style={{ 
                background: 'linear-gradient(to top, #3b82f6, #60a5fa, #93c5fd)',
                zIndex: 1 
              }}
            />
            {/* Water shimmer effect */}
            <motion.div
              className="absolute left-0 bottom-0 w-full"
              initial={{ height: '0%' }}
              animate={{ height: `${Math.min(level + 5, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
              style={{ 
                background: 'linear-gradient(to top, rgba(59, 130, 246, 0.3), transparent)',
                zIndex: 2 
              }}
            />
          </div>
          {/* Body outline - always visible */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/human_body.svg"
              alt="Human Body Outline"
              width={300}
              height={400}
              className="object-contain opacity-80"
              style={{ 
                width: '300px', 
                height: '400px' 
              }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeModel;
