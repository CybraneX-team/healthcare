'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Droplet } from 'lucide-react'
import { sampleDataType } from '@/data/sample-data-type'
import { Card, CardContent } from '@/components/ui/card'

const Card = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 ${className}`}>
    {children}
  </div>
)

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

const Respiratory = ({
  extractedLabData,
}: {
  extractedLabData: sampleDataType
}) => {
  const lungs = extractedLabData.lungs
  // console.log("lungs", lungs)
  return (
    <div className="h-full p-6 text-black overflow-y-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-rows-1 h-auto space-y-4 md:space-y-0">
          {/* Top Row - Respiratory & Retain Capacity */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Respiratory Card */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="rounded-3xl shadow-sm h-auto p-8 bg-gray-100">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 lg:mb-10">
                  Respiratory
                </h2>
                <div className="space-y-2 mt-36">
                  <div>
                    <p className="text-2xl font-normal text-gray-900 mb-2">
                      VO2 Max
                    </p>
                    <p className="text-5xl font-bold text-gray-900 flex">
                      {lungs.vo2_max ? lungs.vo2_max : 'null'}
                      {/* <span className="text-xl mt-4 ml-3 text-gray-600">
                        Excellent
                      </span> */}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Oxygen Delivery Card */}
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <Card className="rounded-3xl shadow-sm h-auto p-8 bg-gray-100">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 lg:mb-10">
                  Oxygen Delivery
                </h2>
                <div className="grid grid-cols-2 gap-8 mt-40">
                  <div>
                    <p className="text-xl text-gray-600 mb-2">HRV</p>
                    <p className="text-3xl font-semibold text-gray-900">
                      {' '}
                      {lungs.heart_rate_variability
                        ? lungs.heart_rate_variability
                        : 'null'}{' '}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-gray-600 mb-2">
                      Pulmonary capacity
                    </p>
                    <p className="text-3xl font-semibold text-gray-900">
                      {lungs.pulmonary_capacity
                        ? lungs.pulmonary_capacity
                        : 'null'}{' '}
                      liters
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Row - Oxygen Delivery & CT Chest */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Retain Capacity Card */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="rounded-3xl shadow-sm h-auto p-8 bg-gray-100">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-10 lg:mb-10">
                  Retain Capacity
                </h2>
                <div className="mt-36">
                  <p className="text-2xl font-normal text-gray-900 mb-2">
                    SpO<sub className="text-lg">2</sub>
                  </p>
                  <p className="text-5xl font-semibold text-gray-900">
                    {' '}
                    {lungs.spo2 ? lungs.spo2 : 'null'} %
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* CT Chest Card */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card className="shadow-sm border-0 bg-white rounded-3xl h-full hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4 h-full">
                  <div className="text-gray-900 text-lg sm:text-xl font-bold mb-4 capitalize">
                    chest impression log
                  </div>

                  <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 rounded-3xl min-h-[200px] lg:h-[87%]">
                    <div className="text-gray-600 text-sm font-bold mb-3">
                      Impressions
                    </div>

                    {/* <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">
                          Above high Heart Rate
                        </span>
                      </div> */}

                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">
                        {lungs?.chest_impression_log
                          ? lungs?.chest_impression_log
                          : 'no data for  chest impression log'}
                      </span>
                    </div>

                    {/* <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        <span className="text-sm text-gray-700">
                          The lungs are clear without consolidation, effusion,
                          discreet mass or pneumothorax.
                        </span>
                      </div> */}
                  </div>

                  {/* </div> */}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Respiratory
