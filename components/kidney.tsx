import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    y: -15,
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const Kidney = () => {
  return (
    <div className="min-h-screen p-4 text-black md:-mt-3">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4"
      >
        {/* Card 1: Kidney Health and Urine PH */}
        <motion.div variants={itemVariants} className="md:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm h-full p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl md:text-3xl font-semibold text-gray-900 mb-20">
                  Kidney Health
                </h2>
                <p className="text-gray-500">Random Urine Albumin</p>
                <div className="mt-2">
                  <p className="text-2xl font-semibold">20</p>
                  <p className="text-xl text-black font-light">mcg/minute</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-500">Urine PH</p>
                <p className="text-2xl font-semibold">6.5</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Hydration */}
        <motion.div variants={itemVariants} className="md:col-span-4">
          <div className="bg-white rounded-3xl shadow-sm h-full p-6">
            <div className="flex flex-col h-full">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                Hydration
              </h2>
              <div className="flex-grow flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <div
                    className="absolute inset-0 border-8 border-blue-500 rounded-full"
                    style={{ clipPath: "inset(50% 0 0 0)" }}
                  ></div>
                  <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
                </div>
              </div>
              <button className="mt-6 bg-gray-100 text-gray-700 rounded-full py-2 px-4 w-full">
                Add Water Intake
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 3: BUN Creatinine ratio */}
        <motion.div variants={itemVariants} className="md:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm h-full p-6">
            <h2 className="text:xl md:text-2xl font-semibold text-gray-900 mb-4">
              BUN Creatinine ratio
            </h2>
            <div className="flex gap-2 mb-6">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                Creatinine
              </span>
              <span className="bg-blue-100 text-blue-500 px-4 py-1 rounded-full text-sm">
                BUN
              </span>
            </div>
            <div className="flex items-center gap-2 mb-6 bg-gray-100 p-3 rounded-3xl">
              <div className="bg-blue-500 h-32 w-8 rounded-full flex items-end">
                <div className="bg-blue-100  w-full rounded-full"></div>
              </div>
              <div className="bg-blue-200 h-32 flex-grow rounded-2xl"></div>
            </div>
            <div>
              <p className="text-2xl font-semibold">117</p>
              <p className="text-gray-500 text-sm">mL/min/1.73 m²</p>
              <p className="text-gray-500 mt-2 text-lg">Creatine Levels</p>
            </div>
          </div>
        </motion.div>

        {/* Card 4: BUN Levels and Stats */}
        <motion.div variants={itemVariants} className="md:col-span-5 ">
          <div className="bg-white rounded-3xl shadow-sm h-full p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <span className="bg-blue-100 text-blue-500 px-4 py-1 rounded-full text-sm">
                Healthy
              </span>
              <div className="text-right">
                <h3 className="md:text-xl font-semibold text-gray-900">
                  BUN Levels
                </h3>
                <p className="text-xl font-light">29mg/dl</p>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="md:text-2xl font-semibold">6mg/dl</p>
                <p className="text-xl text-gray-900">Uric Acid Levels</p>
              </div>

              <div className="text-right">
                <p className="text-gray-500">eGFR</p>
                <p className="text-4xl font-semibold">117</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Kidney;
