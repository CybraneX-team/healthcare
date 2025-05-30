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

export const BrainComponent = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Right column - Stats and cards */}
      <div className="lg:col-span-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Weight Trend Card */}
          <motion.div variants={itemVariants} className="md:col-span-7 h-full">
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300  max-h-96 flex justify-between">
              <CardContent className="p-8 flex justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col justify-between ">
                    {/* Fasting Glucose */}
                    <div className="mb-28">
                      <h3 className="font-semibold text-2xl mb-3">
                        Metabolism
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        Fasting Glucose
                      </p>
                      <p className="text-xl text-gray-500">99 mg/dl</p>
                    </div>

                    {/* Glycated Haemoglobin */}
                    <div className="">
                      <div className="text-xl font-semibold  mb-1">
                        Glycated <br /> Haemoglobin
                      </div>
                      <div className="text-xl  text-gray-500">5.5%</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col ml-60">
                  <div className="w-20 h-56 bg-gray-100 rounded-[100px] flex items-end overflow-hidden ">
                    <div className="w-full h-[65%] bg-[#0066FF] rounded-[100px]" />
                  </div>
                  <p className="text-sm text-[#6B7280] mt-3 text-center leading-tight">
                    High metabolic
                    <br />
                    activity
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alternative Card design (hidden) */}
          <div className="hidden md:col-span-7 h-full">
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 text-black">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-2"></div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-3xl h-full hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-4 h-full text-black">
                <div className="flex flex-col justify-between h-full">
                  {/* Total Weight */}
                  <div className="flex justify-between items-start p-2">
                    <div>
                      <div className="text-lg text-black font-semibold">
                        Insulin
                      </div>
                      <div className="text-3xl font-bold mt-1">16 μU/mL</div>
                    </div>
                    <span className="inline-block px-8 py-3 bg-blue-100 text-blue-500 rounded-full text-sm font-medium">
                      Normal
                    </span>
                  </div>

                  {/* Body Stats */}
                  <div className="p-4 rounded-3xl">
                    <div className="mb-2"></div>
                    <div className="flex justify-end">
                      <div>
                        <div className="text-xl text-gray-500">Hemoglobin</div>
                        <div className="text-lg font-bold mt-1 ml-5">
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Health Rating Card */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-60">
              <CardContent className="p-8">
                <h3 className="font-semibold text-2xl mb-2">200mg/dl</h3>

                <div className="mb-2">
                  <div className="flex justify-between text-lg font-light text-gray-500">
                    <span>Total Cholesterol</span>
                  </div>
                </div>

                {/* <div className="mt-28">
                  <button className="w-[70%] bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-full transition-colors duration-300">
                    Upload Data
                  </button>
                </div> */}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-7">
            <Card className="shadow-sm border-0 bg-white rounded-3xl p-0 overflow-hidden hover:shadow-md transition-shadow duration-300 h-60">
              <CardContent className="p-4 h-full text-black">
                <div className="flex flex-col justify-between h-full">
                  {/* Total Weight */}
                  <div className="flex justify-between items-start p-2">
                    <div>
                      <div className="text-lg text-black font-semibold">
                        Diabetes Risk Score
                      </div>
                      <div className="text-3xl font-bold mt-1 flex items-center">
                        6
                        <span className="text-sm font-light mx-2 text-gray-400">
                          Low risk
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Stats */}
                  <div className="p-4 rounded-3xl">
                    <div className="mb-2"></div>
                    <div className="flex justify-end">
                      <div className="flex flex-col items-end w-80">
                        <button className="w-[70%] text-sm bg-gray-200 hover:bg-gray-300 text-black font-light py-3 px-4 rounded-full transition-colors duration-300 mb-1 ">
                          Upload Sugar Intake
                        </button>
                        <button className="w-[70%] text-sm bg-blue-500 hover:bg-blue-600 text-white font-light py-3 px-4 rounded-full transition-colors duration-300">
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

export default BrainComponent;