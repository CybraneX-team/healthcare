'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    y: -15,
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export const HeartComponent = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full lg:overflow-y-hidden overflow-y-auto"
    >
      {/* Main container with responsive spacing */}
      <div className="grid grid-rows-1 h-auto space-y-4 md:space-y-0">
        {/* Top Row - Heart Status (left) + Lipids and fluids (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Heart Status Card - includes all heart metrics */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-auto hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 h-auto">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 lg:mb-10">
                  Heart Status
                </h2>

                <div className="space-y-3 lg:space-y-4">
                  {/* Heart Rate */}
                  <div>
                    <div className="text-gray-400 text-sm mt-9">Heart Rate</div>
                    <div className="text-black text-lg sm:text-xl font-normal">
                      108 BPM
                    </div>
                  </div>

                  {/* Heart Recovery Rate */}
                  <div>
                    <div className="text-gray-400 text-sm">
                      Heart Recovery Rate
                    </div>
                    <div className="text-black text-lg sm:text-xl font-normal">
                      10 bpm
                    </div>
                  </div>

                  {/* Heart Rate Variability */}
                  <div>
                    <div className="text-gray-400 text-sm">
                      Heart Rate Variability
                    </div>
                    <div className="text-black text-lg sm:text-xl font-normal mb-5">
                      56ms
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lipids and fluids Card - spans 4 columns on desktop, full width on mobile */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-auto hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 h-auto">
                <div className="flex flex-col">
                  {/* Header section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-3 mb-4 lg:mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <svg
                          width="15"
                          height="19"
                          viewBox="0 0 15 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.39109 1.49299C6.65309 1.14299 7.06409 0.937988 7.50009 0.937988C7.93609 0.937988 8.34709 1.14299 8.60909 1.49199C10.4301 3.79199 13.8581 8.46099 13.8581 11.037C13.8581 14.546 11.0091 17.395 7.50009 17.395C3.99109 17.395 1.14209 14.546 1.14209 11.037C1.14209 8.46099 4.57009 3.79199 6.39109 1.49299Z"
                            stroke="#7F7F82"
                            strokeWidth="1.5"
                            strokeMiterlimit="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Lipids and fluids
                      </h2>
                    </div>

                    {/* Ejection Fraction */}
                    <div className="flex flex-col items-start sm:items-end">
                      <div className="text-gray-400 text-base sm:text-lg">
                        Ejection Fraction
                      </div>
                      <div className="text-black text-xl sm:text-2xl font-semibold">
                        65%
                      </div>
                    </div>
                  </div>

                  {/* Grid section - responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {/* Cholesterol */}
                    <div className="rounded-2xl bg-gray-100 p-4 sm:p-5">
                      <div className="text-gray-400 text-sm mb-1">
                        Cholesterol
                      </div>
                      <div className="text-black text-lg sm:text-xl font-bold">
                        145mg/dl
                      </div>
                    </div>

                    {/* Homocysteine */}
                    <div className="rounded-2xl bg-gray-100 p-4 sm:p-5">
                      <div className="text-gray-400 text-sm mb-1">
                        Homocysteine
                      </div>
                      <div className="text-black text-lg sm:text-xl font-bold">
                        15 mcmol/L
                      </div>
                    </div>

                    {/* NT-BNP */}
                    <div className="rounded-2xl bg-gray-100 p-4 sm:p-5">
                      <div className="text-gray-400 text-sm mb-1">NT- BNP</div>
                      <div className="text-black text-lg sm:text-xl font-bold">
                        420 pg/mL
                      </div>
                    </div>

                    {/* HS-CRP */}
                    <div className="rounded-2xl bg-gray-100 p-4 sm:p-5">
                      <div className="text-gray-400 text-sm mb-1">HS-CRP</div>
                      <div className="text-black text-lg sm:text-xl font-bold">
                        2.95 mg/L
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row - responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Troponin & Aortic compliance Card */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 md:p-6 h-auto flex flex-col justify-center space-y-4 lg:space-y-6">
                <div>
                  <div className="text-gray-400 text-sm mb-2">
                    Troponin Levels
                  </div>
                  <div className="text-black text-xl sm:text-2xl font-bold">
                    0.03 <span className="text-sm font-normal">ng/mL</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-2">
                    Aortic compliance
                  </div>
                  <div className="text-black text-xl sm:text-2xl font-bold">
                    1.7 <span className="text-sm font-normal">mL/mmHg</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-2 sm:px-2">
                  <div className="flex flex-col justify-center">
                    <div className="text-gray-400 text-sm mb-2">
                      Blood Pressure
                    </div>
                    <div className="text-black text-xl sm:text-2xl font-bold">
                      119/70<span className="text-sm font-normal">mmHg</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-gray-400 text-sm mb-2">IMT</div>
                    <div className="text-black text-xl sm:text-2xl font-bold mb-4">
                      0.45 mm
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* CT chest Card */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 h-full">
                <div className="text-gray-900 text-lg sm:text-xl font-bold mb-4">
                  CT chest
                </div>

                <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 rounded-3xl min-h-[200px] lg:h-[87%]">
                  <div className="text-gray-600 text-sm font-medium mb-3">
                    Impressions
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">
                        Above high Heart Rate
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">
                        Cholesterol in control in last 30 days
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                      <span className="text-sm text-gray-700">
                        The lungs are clear without consolidation, effusion,
                        discreet mass or pneumothorax.
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default HeartComponent
