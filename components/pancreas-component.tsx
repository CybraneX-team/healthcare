import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

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

export const PancreasComponent = () => {
  return (
    <motion.div
      className="w-full max-w-none h-full overflow-y-auto md:overflow-y-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Right column - Stats and cards */}
      <div className="w-full">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Weight Trend Card */}
          <motion.div variants={itemVariants} className="xl:col-span-7">
            <Card className="shadow-sm border-0 bg-white rounded-2xl lg:rounded-3xl hover:shadow-md transition-shadow duration-300 max-h-80 lg:max-h-90">
              <CardContent className="p-4 lg:p-6 xl:p-6 flex justify-between items-start">
                <div className="flex flex-col justify-between">
                  {/* Fasting Glucose */}
                  <div className="mb-16 lg:mb-20 xl:mb-24">
                    <h3 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-2 lg:mb-3">
                      Metabolism
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-500 mb-1">
                      Fasting Glucose
                    </p>
                    <p className="text-lg lg:text-xl text-gray-500">99 mg/dl</p>
                  </div>

                  {/* Glycated Haemoglobin */}
                  <div>
                    <div className="text-lg  font-semibold mb-1">
                      Glycated <br /> Haemoglobin
                    </div>
                    <div className="text-lg lg:text-xl text-gray-500">5.5%</div>
                  </div>
                </div>
                
                {/* Progress Bar - Moved to the right */}
                <div className="flex flex-col items-center ml-auto">
                  <div className="w-12 lg:w-14 xl:w-16 h-44 lg:h-48 xl:h-56 bg-gray-100 rounded-[100px] flex items-end overflow-hidden">
                    <div className="w-full h-[65%] bg-[#0066FF] rounded-[100px]" />
                  </div>
                  <p className="text-xs lg:text-sm text-[#6B7280] mt-2 lg:mt-3 text-center leading-tight">
                    High metabolic
                    <br />
                    activity
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="xl:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-2xl lg:rounded-3xl h-[95%] hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 h-full text-black">
                <div className="flex flex-col justify-between h-full">
                  {/* Total Weight */}
                  <div className="flex justify-between items-start lg:p-2">
                    <div>
                      <div className="text-base lg:text-lg text-black font-semibold">
                        Insulin
                      </div>
                      <div className="text-2xl font-bold mt-1">16 μU/mL</div>
                    </div>
                    <span className="inline-block px-4 lg:px-6 xl:px-8 py-2 lg:py-3 bg-blue-100 text-blue-500 rounded-full text-xs lg:text-sm font-medium">
                      Normal
                    </span>
                  </div>

                  {/* Body Stats */}
                  <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl">
                    <div className="mb-2"></div>
                    <div className="flex justify-end">
                      <div>
                        <div className="text-lg lg:text-xl text-gray-500">Hemoglobin</div>
                        <div className="text-base lg:text-lg font-bold mt-1 ml-3 lg:ml-5">
                          13 μU/mL
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Health Rating Card */}
          <motion.div variants={itemVariants} className="xl:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-2xl lg:rounded-3xl hover:shadow-md transition-shadow duration-300 h-48 lg:h-56 xl:h-60">
              <CardContent className="p-4 lg:p-6">
                <h3 className="font-semibold text-lg lg:text-xl xl:text-2xl mb-2">200mg/dl</h3>

                <div className="mb-2">
                  <div className="flex justify-between text-base lg:text-lg font-light text-gray-500">
                    <span>Total Cholesterol</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-7">
            <Card className="shadow-sm border-0 bg-white rounded-2xl lg:rounded-3xl p-0 overflow-hidden hover:shadow-md transition-shadow duration-300 h-48 lg:h-56 xl:h-60">
              <CardContent className="p-3 lg:p-4 h-full text-black">
                <div className="flex flex-col justify-between h-full">
                  {/* Total Weight */}
                  <div className="flex justify-between items-start p-1 lg:p-2">
                    <div>
                      <div className="text-base lg:text-lg text-black font-semibold">
                        Diabetes Risk Score
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold mt-1 flex items-center">
                        6
                        <span className="text-xs lg:text-sm font-light mx-2 text-gray-400">
                          Low risk
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Stats */}
                  <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl">
                    <div className="mb-2"></div>
                    <div className="flex justify-end">
                      <div className="flex flex-col items-end w-60 lg:w-72 xl:w-80">
                        <button className="w-[70%] text-xs lg:text-sm bg-gray-200 hover:bg-gray-300 text-black font-light py-2 lg:py-3 px-3 lg:px-4 rounded-full transition-colors duration-300 mb-1">
                          Upload Sugar Intake
                        </button>
                        <button className="w-[70%] text-xs lg:text-sm bg-blue-500 hover:bg-blue-600 text-white font-light py-2 lg:py-3 px-3 lg:px-4 rounded-full transition-colors duration-300">
                          Body Fluids
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PancreasComponent;