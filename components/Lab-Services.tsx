import { useState } from 'react'
import { LabsSection } from './labSection'
import { ServicesProductsSection } from './ServicesSection'
import Image from 'next/image'
import { motion } from 'framer-motion'

export const CombinedLabsSection = ({ extractedLabData }: any) => {
  const [showServices, setShowServices] = useState(false)

  const organs = [
    { id: 'heart', image: '/onlyheart_light.svg', alt: 'Heart' },
    { id: 'lungs', image: '/onlylungs_light.svg', alt: 'Lungs' },
    { id: 'liver', image: '/onlyliver_light.svg', alt: 'Liver' },
    { id: 'brain', image: '/onlybrain_light.svg', alt: 'Brain' },
    { id: 'kidney', image: '/onlykidneys_light.svg', alt: 'Kidneys' },
    {
      id: 'reproductive',
      dataKey: 'hormonal_reproductive',
      image: '/onlymr_light.svg',
      alt: 'Reproductive',
    },
  ]

  const getTotalKeys = (obj: any): number => {
    if (obj === null || typeof obj !== 'object') return 1
    return Object.values(obj).reduce(
      (acc: number, val: any) => acc + getTotalKeys(val),
      0,
    )
  }

  const getNonNullCount = (obj: any): number => {
    if (obj === null) return 0
    if (typeof obj !== 'object') return obj !== '' ? 1 : 0
    return Object.values(obj).reduce(
      (acc: number, val: any) => acc + getNonNullCount(val),
      0,
    )
  }

  const organsWithDynamicProgress = organs.map((e) => {
    const objectOfOrgan = extractedLabData?.[e.dataKey || e.id] ?? {}
    const totalKeys = getTotalKeys(objectOfOrgan)
    const nonNullCount = getNonNullCount(objectOfOrgan)
    const progress = totalKeys > 0 ? (nonNullCount / totalKeys) * 100 : 0
    return { ...e, progress }
  })

  const totalOrganData = organs.map(
    (e) => extractedLabData?.[e.dataKey || e.id] ?? {},
  )
  const totalKeys = totalOrganData.reduce(
    (acc, organ) => acc + getTotalKeys(organ),
    0,
  )
  const totalNonNull = totalOrganData.reduce(
    (acc, organ) => acc + getNonNullCount(organ),
    0,
  )
  const totalProgress = totalKeys > 0 ? (totalNonNull / totalKeys) * 100 : 0

  return (
    <div className="flex flex-col gap-6 mt-14 mb-8 md:px-10 px-0">
      {/* Header Row */}
      <div className="flex items-center md:justify-between justify-center flex-wrap gap-4 md:px-10 px-0">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 shadow-sm">
          <button
            className={`rounded-lg px-6 py-2 font-medium ${
              !showServices ? 'bg-blue-500 text-white' : 'text-gray-700'
            } text-sm transition-colors duration-300`}
            onClick={() => setShowServices(false)}
          >
            Diagnostics
          </button>
          <button
            className={`rounded-lg px-6 py-2 font-medium ${
              showServices ? 'bg-blue-500 text-white' : 'text-gray-700'
            } text-sm transition-colors duration-300`}
            onClick={() => setShowServices(true)}
          >
            Interventions
          </button>
        </div>

        {/* Digital Twin Rectangular Progress Card */}
        <motion.div
          className="group relative flex items-center bg-white/30 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 gap-4 transition duration-300 hover:bg-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Vitruvian Image */}
          <div className="relative w-16 h-16 rounded-full shrink-0">
            <Image
              src="/vitruvian.jpg"
              alt="Vitruvian Man"
              layout="fill"
              className="rounded-full"
              objectFit="contain"
            />
          </div>

          {/* Progress Info */}
          <div className="flex flex-col w-64">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Digital Twin Progress
            </div>
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
            <div className="text-sm font-semibold text-blue-600 mt-1">
              {Math.round(totalProgress)}%
            </div>
          </div>

          {/* Organ Hover Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-white rounded-xl z-20 opacity-0 group-hover:opacity-100 transition duration-300 flex justify-center items-center gap-4 px-4 py-2">
            {organsWithDynamicProgress.map((organ) => (
              <div key={organ.id} className="flex flex-col items-center w-14">
                <div className="relative w-10 h-10">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
                    <Image
                      src={organ.image}
                      alt={organ.alt}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 16}`}
                        strokeDashoffset={`${
                          (1 - organ.progress / 100) * 2 * Math.PI * 16
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 mt-1 text-center whitespace-nowrap">
                  {organ.alt}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Section Content */}
      <div className="transition-opacity duration-300">
        {showServices ? <ServicesProductsSection /> : <LabsSection />}
      </div>
    </div>
  )
}
