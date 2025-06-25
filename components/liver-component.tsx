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

const barVariants = {
  hidden: { scaleY: 0 },
  visible: (i) => ({
    scaleY: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: 'easeOut',
    },
  }),
}

// Type definition for gut health item
interface GutHealthItem {
  name: string
  value: number
  height: number
  color: string
}

const gutHealthData: GutHealthItem[] = [
  { name: 'Amylase', value: 85, height: 100, color: 'bg-blue-500' },
  { name: 'Maltase', value: 95, height: 85, color: 'bg-blue-600' },
  { name: 'Protease', value: 40, height: 35, color: 'bg-blue-200' },
  { name: 'Lactase', value: 88, height: 75, color: 'bg-blue-500' },
  { name: 'Lipase', value: 70, height: 50, color: 'bg-blue-300' },
  { name: 'Proteases', value: 90, height: 80, color: 'bg-blue-600' },
  { name: 'Sucrase', value: 92, height: 82, color: 'bg-blue-600' },
  { name: 'Occult Blood', value: 45, height: 40, color: 'bg-blue-200' },
]

export const LiverComponent = () => {
  return (
    <motion.div
      className="w-full h-full overflow-y-auto md:overflow-y-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Liver Care Card */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-0 bg-white rounded-3xl h-auto">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800 text-lg">Liver Care</h3>
              {/* Bilirubin Card */}
              <h3 className="text-gray-800 text-xs mb-2">Bilirubin</h3>
              <div className="text-2xl md:text-xs font-semibold">1.3 mg/dl</div>
              <div className="mt-8 md:mt-20">
                <div className="text-gray-500 text-sm">Fatty Liver</div>
                <div className="text-2xl font-semibold mt-1">Grade III</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Results Cards - spans 3 columns on larger screens */}
        <motion.div
          variants={itemVariants}
          className="col-span-1 md:col-span-3 bg-white p-1 rounded-3xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* ALT Card */}
            <Card className="shadow-sm bg-gray-100 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6 md:h-56">
                <h3 className="font-bold text-gray-800 text-2xl md:text-3xl mb-0">
                  ALT
                </h3>
                <div className="text-2xl md:text-3xl font-extralight mt-2">
                  80 U/L
                </div>
              </CardContent>
            </Card>

            {/* AST Card */}
            <Card className="shadow-sm bg-gray-100 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold text-gray-800 text-2xl md:text-3xl mb-2">
                  AST
                </h3>
                <div className="text-2xl md:text-3xl font-extralight">
                  35 U/L
                </div>
              </CardContent>
            </Card>

            {/* GGT Card */}
            <Card className="shadow-sm bg-gray-100 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold text-gray-800 text-2xl md:text-3xl mb-2">
                  GGT
                </h3>
                <div className="text-2xl md:text-3xl font-extralight">
                  53 U/L
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Gut Health Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-0 bg-white rounded-3xl h-auto md:mt-0 mt-4">
          <CardContent className=" flex flex-col md:flex-row gap-6">
            {/* Left Section - Gut Score and SNPs */}
            <div className="w-full md:py-2 py-4 md:w-1/3 flex flex-col justify-between flex-grow">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-1">
                  Gut Health
                </h2>
                <p className="text-sm text-gray-500 mb-4">Gut Health Score</p>
                <div className="text-4xl font-bold text-gray-800 mb-10">
                  65%
                </div>
              </div>

              <div className="space-y-6 bg-gray-100 md:w-[80%] rounded-3xl px-6 py-10">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 font-medium">SNPs</p>
                  <div className="flex justify-between flex-col items-center">
                    <p className="font-semibold text-gray-800">C677T</p>
                    <p className="text-xs text-gray-500">RS1801133</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">CT</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 font-medium">SNPs</p>
                  <div className="flex justify-between flex-col items-center">
                    <p className="font-semibold text-gray-800">GSTM1</p>
                    <p className="text-xs text-gray-500">Null variant</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">AA</p>
                </div>
              </div>
            </div>

            {/* Right Section - Chart */}
            <div className="bg-white rounded-2xl flex items-end justify-center gap-2 md:gap-6 h-auto">
              {gutHealthData.map((item, index) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div
                    className="relative mb-2 flex items-end"
                    style={{ height: '200px' }}
                  >
                    <motion.div
                      custom={index}
                      variants={barVariants}
                      className={`${item.color} rounded-full origin-bottom w-8 md:w-10`}
                      style={{
                        height: `${item.height}%`,
                        transformOrigin: 'bottom',
                      }}
                    />
                  </div>
                  <div className="md:text-xs text-[10px] text-gray-600 text-center leading-tight max-w-auto">
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default LiverComponent
