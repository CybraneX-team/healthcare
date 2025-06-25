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
      liver: '#f59e0b',
      heart: '#ef4444',
      lungs: '#3b82f6',
      brain: '#8b5cf6',
      kidney: '#8b5cf6',
      reproductive: '#ec4899',
    }
    return colors[organId as keyof typeof colors] || '#6b7280'
  }

  const calculateArrowEndpoint = (organ: OrganInfo) => {
    const { position } = organ
    return { x: position.x, y: position.y }
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative w-full" style={{ height: '500px' }}>
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
                height: 'auto',
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
              style={{ zIndex: 0 }}
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
                height={0}
                className="object-contain"
                style={{ width: '550px', height: 'auto', objectFit: 'contain' }}
                onLoad={() => setIsLoaded(true)}
                priority
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
