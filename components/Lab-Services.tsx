import { useState } from 'react'
import { LabsSection } from './labSection'
import { ServicesProductsSection } from './ServicesSection'
import Image from 'next/image'
import { motion } from 'framer-motion'

export const CombinedLabsSection = ({extractedLabData} : any) => {
  const [showServices, setShowServices] = useState(false)



const organs = [
  { id: 'heart', image: '/onlyheart_light.svg', alt: 'Heart' },
  { id: 'lungs', image: '/onlylungs_light.svg', alt: 'Lungs' },
  { id: 'liver', image: '/onlyliver_light.svg', alt: 'Liver' },
  { id: 'brain', image: '/onlybrain_light.svg', alt: 'Brain' },
  { id: 'kidney', image: '/onlykidneys_light.svg', alt: 'Kidneys' },
  { id: 'reproductive', dataKey: 'hormonal_reproductive', image: '/onlymr_light.svg', alt: 'Reproductive' },
];

// Helper to recursively count total keys
const getTotalKeys = (obj: any): number => {
  if (obj === null || typeof obj !== 'object') return 1;
  return Object.values(obj).reduce((acc: number, val: any) => acc + getTotalKeys(val), 0);
};

// Helper to recursively count non-null, non-empty values
const getNonNullCount = (obj: any): number => {
  if (obj === null) return 0;
  if (typeof obj !== 'object') return obj !== '' ? 1 : 0;
  return Object.values(obj).reduce((acc: number, val: any) => acc + getNonNullCount(val), 0);
};


  const organsWithDynamicProgress = organs.map((e) => {
  const objectOfOrgan = extractedLabData?.[e.dataKey || e.id] ?? {};
  const totalKeys = getTotalKeys(objectOfOrgan);
  const nonNullCount = getNonNullCount(objectOfOrgan);
  const progress = totalKeys > 0 ? (nonNullCount / totalKeys) * 100 : 0;

  console.log(`Progress for ${e.id}: ${progress}%`);
  return { ...e, progress };
});


  return (
    <div className="flex flex-col gap-6 mt-14 mb-8 md:px-10 px-0">
  {/* Header row: Tabs on the left, organ progress on the right */}
  <div className="flex items-center md:justify-between justify-center flex-wrap gap-4 md:px-10 px-0">
    {/* Tabs: Diagnostics / Interventions */}
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

    {/* Organ Progress Circles */}
    <motion.div
      className="flex gap-4 overflow-x-auto px-2 scrollbar-none bg-transparent md:bg-white/30 rounded-xl p-2 backdrop-blur-md border border-white/20"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {organsWithDynamicProgress.map((organ) => (
        <div key={organ.id} className="flex flex-col items-center w-16">
          <div className="relative w-12 h-12">
            {/* Icon Circle */}
            <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white">
              <Image
                src={organ.image}
                alt={organ.alt}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>

            {/* Progress Circle Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="4"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${
                    (1 - organ.progress / 100) * 2 * Math.PI * 20
                  }`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-1 text-center whitespace-nowrap">
            {organ.alt}
          </span>
        </div>
      ))}
    </motion.div>
  </div>

  {/* Section Content */}
  <div className="transition-opacity duration-300">
    {showServices ? <ServicesProductsSection /> : <LabsSection />}
  </div>
</div>

  )
}
