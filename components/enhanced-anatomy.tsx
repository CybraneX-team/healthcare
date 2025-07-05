'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface OrganInfo {
  id: string
  name: string
  position: { x: number; y: number }
  dotPosition: { x: number; y: number }
  imagePath: string
}

interface EnhancedAnatomyProps {
  selectedOrgan: string
  onOrganSelect: (organId: string) => void
}

const organData: OrganInfo[] = [
  {
    id: 'liver',
    name: 'Liver',
    position: { x: 85, y: 45 },
    dotPosition: { x: 45, y: 41 },
    imagePath: '/liver_light.svg',
  },
  {
    id: 'heart',
    name: 'Heart',
    position: { x: 0, y: 25 },
    dotPosition: { x: 53, y: 37 },
    imagePath: '/heart_light.svg',
  },
  {
    id: 'lungs',
    name: 'Lungs',
    position: { x: 80, y: 30 },
    dotPosition: { x: 50, y: 35 },
    imagePath: '/lungs_light.svg',
  },
  {
    id: 'brain',
    name: 'Brain',
    position: { x: 20, y: 8 },
    dotPosition: { x: 50, y: 17 },
    imagePath: '/brain_light.svg',
  },
  {
    id: 'kidney',
    name: 'Kidney',
    position: { x: -10, y: 50 },
    dotPosition: { x: 45, y: 55 },
    imagePath: '/kidneys_light.svg',
  },
  {
    id: 'reproductive',
    name: 'Reproductive',
    position: { x: 80, y: 65 },
    dotPosition: { x: 48, y: 60 },
    imagePath: '/mr_light.svg',
  },
]

const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
    },
  },
}

const labelVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.8,
      ease: 'easeOut',
    },
  },
}

export default function EnhancedAnatomy({
  selectedOrgan,
  onOrganSelect,
}: EnhancedAnatomyProps) {
  const [isLoaded, setIsLoaded] = useState(true)
  const [currentImagePath, setCurrentImagePath] = useState('/liver_light.png')

  useEffect(() => {
    const selectedOrganData = organData.find(
      (organ) => organ.id === selectedOrgan,
    )
    if (selectedOrganData) {
      setCurrentImagePath(selectedOrganData.imagePath)
    }
  }, [selectedOrgan])

  useEffect(() => {
    const preloadImages = () => {
      organData.forEach((organ) => {
        const img = document.createElement('img')
        img.src = organ.imagePath
      })
    }
    preloadImages()
    setIsLoaded(true)
  }, [])

  const getOrganOpacity = (organId: string) => {
    return selectedOrgan === organId ? 1 : 0.3
  }

  const getLineColor = (organId: string) => {
    const colors = {
      liver: '#3b82f6',
      heart: '#3b82f6',
      lungs: '#3b82f6',
      brain: '#3b82f6',
      kidney: '#3b82f6',
      reproductive: '#3b82f6',
    }
    return colors[organId as keyof typeof colors] || '#3b82f6'
  }

  const calculateArrowEndpoint = (organ: OrganInfo) => {
    const { position } = organ
    return { x: position.x, y: position.y }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative w-full" style={{ height: '750px' }}>
        {/* Image Container for Crossfade */}
        <div className="absolute inset-0 flex items-start justify-center pt-2">
          {/* Background anatomy image */}
          <div className="absolute inset-0 flex items-start justify-center pt-2">
            <Image
              src="/bg_anatomy.svg"
              alt="Anatomy Background"
              width={550}
              height={700}
              className="object-contain"
              style={{
                width: '550px',
                height: '700px',
                objectFit: 'contain',
                zIndex: 0,
              }}
              priority
            />
          </div>

          {/* Organ images with crossfade */}
          {organData.map((organ, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 flex items-start justify-center pt-2"
              style={{ zIndex: 1 }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentImagePath === organ.imagePath ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Image
                src={organ.imagePath}
                alt={organ.name}
                width={550}
                height={700}
                className="object-contain"
                style={{
                  width: '550px',
                  height: '700px',
                  objectFit: 'contain',
                }}
                onLoad={() => setIsLoaded(true)}
                priority
              />
            </motion.div>
          ))}
        </div>

        {/* Overlay SVG for lines and dots */}

        {/* Organ labels */}
        {isLoaded &&
          organData.map((organ) => (
            <motion.div
              key={`label-${organ.id}`}
              className="absolute pointer-events-auto"
              style={{
                left: `${organ.position.x}%`,
                top: `${organ.position.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: getOrganOpacity(organ.id),
                zIndex: 3,
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
                ${selectedOrgan === organ.id ? 'border-2 shadow-2xl transform scale-105' : 'border-white/50'}
              `}
                style={{
                  borderColor:
                    selectedOrgan === organ.id
                      ? getLineColor(organ.id)
                      : undefined,
                  boxShadow:
                    selectedOrgan === organ.id
                      ? `0 8px 32px ${getLineColor(organ.id)}30, 0 0 0 1px ${getLineColor(organ.id)}20`
                      : '0 4px 16px rgba(0,0,0,0.1)',
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
                  ${selectedOrgan === organ.id ? 'text-gray-900' : 'text-gray-700'}
                `}
                  style={{
                    color:
                      selectedOrgan === organ.id
                        ? getLineColor(organ.id)
                        : undefined,
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
  )
}
