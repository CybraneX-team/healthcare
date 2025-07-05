'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Droplet } from 'lucide-react'
import { sampleDataType } from '@/data/sample-data-type'

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

const Cardiology = ({
  extractedLabData,
}: {
  extractedLabData: sampleDataType
}) => {
  const heart = extractedLabData.heart

  return (
    <div className="h-full p-3 text-black overflow-y-auto lg:overflow-y-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-7xl mx-auto"
      >
        <div className="block lg:hidden space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Scan Cardiology
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500">Heart Rate</p>
                  <p className="text-lg font-semibold">
                    {heart.heart_rate ?? 'Null'} BPM
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cardiac Output</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
                <div>
                  <p className="text-gray-500">Calcium Score</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gray-100 p-4 rounded-3xl">
                  <Droplet size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lipids And Cholesterol
                  </h2>
                  <span className="text-lg font-medium text-gray-500">
                    {heart.cholesterol ?? 'Null'} mg/dl
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Blood Pressure</p>
                  <p className="text-lg font-semibold">
                    {heart.blood_pressure?.systolic !== null &&
                    heart.blood_pressure?.diastolic !== null
                      ? `${heart.blood_pressure.systolic}/${heart.blood_pressure.diastolic} mm Hg`
                      : 'Null'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Homocysteine</p>
                  <p className="text-lg font-semibold">
                    {heart.homocysteine ?? 'Null'} mcmol/L
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">LDL</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
                <div>
                  <p className="text-gray-500">HDL</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-sm p-4 md:p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Troponin Levels</p>
                  <p className="text-lg font-semibold">
                    {heart.troponin ?? 'Null'} ng/mL
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Aortic compliance</p>
                  <p className="text-lg font-semibold">
                    {heart.aortic_compliance ?? 'Null'} mL/mmHg
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">BNP</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
                <div>
                  <p className="text-gray-500">NT- BNP</p>
                  <p className="text-lg font-semibold">
                    {heart.nt_bnp ?? 'Null'} pg/mL
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="rounded-3xl shadow-sm p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Vessels and Performance
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-2xl">
                  <p className="text-gray-500 text-sm">Stroke Volume</p>
                  <p className="text-sm font-semibold">Null</p>
                </div>
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-2xl">
                  <p className="text-gray-500 text-sm">Ejection Fraction</p>
                  <p className="text-sm font-semibold">Null</p>
                </div>
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-2xl">
                  <p className="text-gray-500 text-sm">Pulmonary Veins</p>
                  <p className="text-sm font-semibold">2.2 cm</p>
                </div>
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-2xl">
                  <p className="text-gray-500 text-sm">Ascending Aorta</p>
                  <p className="text-sm font-semibold">3 cm</p>
                </div>
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-2xl">
                  <p className="text-gray-500 text-sm">Superior Vena Cava</p>
                  <p className="text-sm font-semibold">2.2 cm</p>
                </div>
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-2xl">
                  <p className="text-gray-500 text-sm">Inferior Vena Cava</p>
                  <p className="text-sm font-semibold">2.7 cm</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="hidden lg:grid grid-cols-12 gap-4">
          <motion.div variants={itemVariants} className="col-span-5">
            <Card className="rounded-3xl shadow-sm h-full p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Scan Cardiology
              </h2>
              <div className="space-y-4 -mb-10">
                <div>
                  <p className="text-gray-500">Heart Rate</p>
                  <p className="text-lg font-semibold">
                    {heart.heart_rate ?? 'Null'} BPM
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cardiac Output</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
                <div>
                  <p className="text-gray-500">Calcium Score</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-7 col-start-6"
          >
            <Card className="rounded-3xl shadow-sm h-full p-8">
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-gray-100 p-8 rounded-3xl">
                      <Droplet size={20} className="text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Lipids And <br /> Cholesterol
                      <span className="text-lg font-medium ml-4 text-gray-500">
                        {heart.cholesterol ?? 'Null'} mg/dl
                      </span>
                    </h2>
                  </div>
                  <div className="space-y-6 mt-6">
                    <div>
                      <p className="text-gray-500">Homocysteine</p>
                      <p className="text-lg font-semibold">
                        {heart.homocysteine ?? 'Null'} mcmol/L
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-gray-500">LDL</p>
                        <p className="text-lg font-semibold">Null</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="mb-20">
                    <p className="text-gray-500">Blood Pressure</p>
                    <p className="text-lg font-semibold">
                      {heart.blood_pressure?.systolic !== null &&
                      heart.blood_pressure?.diastolic !== null
                        ? `${heart.blood_pressure.systolic}/${heart.blood_pressure.diastolic} mm Hg`
                        : 'Null'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">HDL</p>
                    <p className="text-lg font-semibold">Null</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-6 col-start-1"
          >
            <Card className="rounded-3xl shadow-sm h-full p-8">
              <div>
                <p className="text-gray-500">Troponin Levels</p>
                <p className="text-lg font-semibold">
                  {heart.troponin ?? 'Null'} ng/mL
                </p>
              </div>
              <div className="mt-6">
                <p className="text-gray-500">Aortic compliance</p>
                <p className="text-lg font-semibold">
                  {heart.aortic_compliance ?? 'Null'} mL/mmHg
                </p>
              </div>
              <div className="flex justify-between mt-10">
                <div>
                  <p className="text-gray-500">BNP</p>
                  <p className="text-lg font-semibold">Null</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">NT- BNP</p>
                  <p className="text-lg font-semibold">
                    {heart.nt_bnp ?? 'Null'} pg/mL
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="col-span-6 col-start-7"
          >
            <Card className="rounded-3xl shadow-sm h-full p-3">
              <div className="flex flex-col md:flex-row w-full items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 ">
                  Vessels and Performance
                </h2>
                <div className="flex justify-between w-full items-center bg-gray-100 px-5 py-4 rounded-3xl ml-2">
                  <p className="text-gray-500 text-sm">
                    Stroke
                    <br /> Volume
                  </p>
                  <p className="text-xs font-semibold">Null</p>
                </div>
                <div className="flex justify-between w-full items-center bg-gray-100 px-5 py-4 mt-4 md:mt-0 ml-2 rounded-3xl">
                  <p className="text-gray-500 text-sm">Ejection Fraction</p>
                  <p className="text-xs font-semibold">Null</p>
                </div>
              </div>
              <div className="grid grid-cols-6 grid-rows-4 -mb-3 gap-2">
                <div className="col-span-4 row-span-2 row-start-1 col-start-1 flex justify-between items-center bg-gray-100 px-5 py-4 rounded-3xl">
                  <p className="text-gray-500 text-sm">Pulmonary Veins</p>
                  <p className="text-xs font-semibold">Null</p>
                </div>
                <div className="col-span-2 row-span-2 col-start-5 row-start-1 flex justify-between items-center bg-gray-100 px-5 py-4 rounded-3xl">
                  <p className="text-gray-500 text-sm">Ascending Aorta</p>
                  <div className="items-center text-center jsutify-center">
                    <p className="text-xs font-semibold">Null</p>
                    {/* <p className="text-xs font-semibold">cm</p> */}
                  </div>
                </div>
                <div className="col-span-2 row-span-2 row-start-3 flex justify-between items-center bg-gray-100 px-5 py-4 rounded-3xl">
                  <p className="text-gray-500 text-sm">Superior Vena Cava</p>
                  <p className="text-xs font-semibold">Null</p>
                </div>
                <div className="col-span-2 row-span-2 col-start-3 row-start-3 flex justify-between items-center bg-gray-100 px-5 py-4 rounded-3xl">
                  <p className="text-gray-500 text-sm">Inferior Vena Cava</p>
                  <p className="text-xs font-semibold">Null</p>
                </div>
                <div className="col-span-2 row-span-2 col-start-5 row-start-3 flex justify-between items-center bg-gray-100 px-5 py-4 rounded-3xl">
                  <p className="text-gray-500 text-sm">Pulmonary Veins</p>
                  <p className="text-xs font-semibold">Null</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Cardiology
