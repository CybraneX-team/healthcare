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
    <div className="relative w-full max-w-xs mx-auto flex items-center justify-center" style={{ height: '500px' }}>
      <div
        className="relative flex items-center justify-center bg-gradient-to-b from-blue-50 to-white rounded-3xl shadow-xl border border-blue-100"
        style={{ width: '320px', height: '440px', padding: '16px' }}
      >
        {/* Water fill with SVG mask applied to the container */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
          style={{
            width: '280px',
            height: '380px',
            maskImage: 'url(/human_body_mask.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/human_body_mask.svg)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            zIndex: 1,
          }}
        >
          {/* Water fill animation */}
          <motion.div
            className="absolute left-0 bottom-0 w-full shadow-lg"
            initial={{ height: '0%' }}
            animate={{ height: `${level}%` }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{
              background:
                'linear-gradient(180deg, #60a5fa 0%, #3b82f6 60%, #2563eb 100%)',
              boxShadow: '0 0 32px 8px rgba(59,130,246,0.15)',
              filter: 'blur(0.5px)',
              borderRadius: '0 0 32px 32px',
              zIndex: 2,
            }}
          />
          {/* Water shimmer effect */}
          <motion.div
            className="absolute left-0 bottom-0 w-full pointer-events-none"
            initial={{ height: '0%' }}
            animate={{ height: `${Math.min(level + 5, 100)}%` }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
            style={{
              background:
                'linear-gradient(to top, rgba(59, 130, 246, 0.18), transparent)',
              filter: 'blur(2px)',
              zIndex: 3,
            }}
          />
        </div>
        {/* Body outline - always visible */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none" style={{ zIndex: 4 }}>
          <Image
            src="/human_body.svg"
            alt="Human Body Outline"
            width={280}
            height={380}
            className="object-contain opacity-90 drop-shadow-md"
            style={{ width: '280px', height: '380px' }}
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default WaterIntakeModel;
