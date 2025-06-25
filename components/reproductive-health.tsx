'use client'

import { motion } from 'framer-motion'

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

export default function ReproductiveHealth() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full overflow-y-auto md:overflow-y-hidden"
    >
      <div className="min-h-full p-4 md:p-8">
        {/* Main Content Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
          {/* Left Column */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            {/* Header Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl p-4 w-full"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-gray-100 rounded-2xl flex justify-center items-center h-16 w-16 text-3xl">
                  ⚥
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Reproductive and Hormones
                </h1>
              </div>

              {/* Values Section */}
              <div className="grid gap-6">
                <div>
                  <h2 className="text-sm text-gray-500">Transferrin</h2>
                  <div className="text-lg font-semibold text-gray-900">
                    253 <span className="text-sm text-gray-500">mg/dL</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2 mt-12">
                  <div>
                    <h2 className="text-sm text-gray-500">Insulin (Fasting)</h2>
                    <div className="text-lg font-semibold text-gray-900">
                      25 <span className="text-sm text-gray-500">μIU/mL</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-md font-bold text-right text-gray-900">
                      IGF-1
                    </h2>
                    <div className="text-lg font-normal text-gray-900">
                      250 <span className="text-sm text-gray-500">ng/mL</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl md:px-6 md:py-4 p-4  w-full"
            >
              {/* Top Row with Cortisol and Relief Ring */}
              <div className="flex flex-row sm:flex-row justify-between items-start sm:items-center mb-12 gap-2">
                <div>
                  <h2 className="text-lg font-medium text-gray-500">
                    Cortisol
                  </h2>
                  <div className="text-xl font-bold text-gray-900">
                    15{' '}
                    <span className="text-base font-normal text-gray-700">
                      µg/dL
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center bg-gray-100 p-3 rounded-2xl w-16 h-16">
                  <svg width="32" height="32" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      stroke="#d1d5db"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeDasharray="100"
                      strokeDashoffset="75"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-xs text-gray-600 mt-1">Relief</div>
                </div>
              </div>

              {/* Parathyroid Hormone */}
              <div className="pt-20">
                <h2 className="text-lg font-medium text-gray-500">
                  Parathyroid Hormone
                </h2>
                <div className="text-2xl font-bold text-gray-900">
                  45
                  <span className="text-base font-normal text-gray-700">
                    pg/mL
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="col-span-12 md:col-span-7 space-y-4">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl p-2 h-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Column 1 */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-gray-100 rounded-3xl p-4 space-y-8">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Estrogen
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        47{' '}
                        <span className="text-sm font-normal text-gray-700">
                          pg/mL
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Androstenedione
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        2.5{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/mL
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Progesterone
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        1.4{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/mL
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-3xl p-4 space-y-20">
                    <div className="flex flex-row justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Testosterone
                        </h3>
                        <p className="text-xl font-bold text-gray-900">
                          1070{' '}
                          <span className="text-sm font-normal text-gray-700">
                            ng/dL
                          </span>
                        </p>
                      </div>
                      <div className="text-right sm:text-left">
                        <h3 className="text-sm font-medium text-gray-500">
                          DHT
                        </h3>
                        <p className="text-xl font-bold text-gray-900">32</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Vitamin D 25–OH
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        52{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/mL
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-3xl px-4 py-7 items-center flex flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">TSH</h3>
                      <p className="text-xl font-bold text-gray-900">
                        2.5{' '}
                        <span className="text-sm font-normal text-gray-700">
                          mIU/L
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        DHEA-S
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        150{' '}
                        <span className="text-sm font-normal text-gray-700">
                          µg/dL
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-gray-100 rounded-3xl px-4 py-6 items-center flex flex-row justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Estrone
                      </h3>
                      <p className="text-xl font-bold text-gray-900">N/A</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Prolactin
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        23{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/mL
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-3xl px-4 py-6 items-center flex flex-row justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Estradiol
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        3.4{' '}
                        <span className="text-sm font-normal text-gray-700">
                          pg/mL
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total T3
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        120{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/dL
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-3xl px-4 py-6 items-center flex flex-row justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Free T3
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        3.4{' '}
                        <span className="text-sm font-normal text-gray-700">
                          pg/mL
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total T3
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        120{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/dL
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-3xl px-4 py-6 items-center flex flex-row justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Free T4
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        1.2{' '}
                        <span className="text-sm font-normal text-gray-700">
                          ng/dL
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Total T4
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        9{' '}
                        <span className="text-sm font-normal text-gray-700">
                          µg/dL
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 rounded-3xl px-4 py-6 items-center flex flex-row justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">LDH</h3>
                      <p className="text-xl font-bold text-gray-900">
                        256{' '}
                        <span className="text-sm font-normal text-gray-700">
                          U/L
                        </span>
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        HbA1c
                      </h3>
                      <p className="text-xl font-bold text-gray-900">
                        6.2{' '}
                        <span className="text-sm font-normal text-gray-700">
                          %
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
