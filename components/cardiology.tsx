import React from "react";
import { motion } from "framer-motion";
import { DropletIcon } from "lucide-react";
import { Card } from "./ui/card";

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

const Cardiology = () => {
  return (
    <div className="min-h-screen  p-3 text-black">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4"
      >
        {/* Card 1: Scan Cardiology */}
        <motion.div variants={itemVariants} className="md:col-span-4">
          <Card className="bg-white rounded-3xl shadow-sm h-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Scan Cardiology
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-gray-500">Heart Rate</p>
                <p className="text-lg font-semibold">108 BPM</p>
              </div>

              <div>
                <p className="text-gray-500">Cardiac Output</p>
                <p className="text-lg font-semibold">5.2 L/m</p>
              </div>

              <div>
                <p className="text-gray-500">Calcium Score</p>
                <p className="text-lg font-semibold">244</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card 2: Combined Lipids, Cholesterol and Blood Pressure */}
        <motion.div variants={itemVariants} className="md:col-span-8">
          <Card className="bg-white rounded-3xl shadow-sm h-full p-4">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className=" bg-gray-100 p-8 rounded-3xl ">
                    <DropletIcon size={20} className="text-blue-500 " />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lipids And <br /> Cholesterol
                    <span className="text-lg font-medium ml-4 text-gray-500">
                      145mg/dl
                    </span>
                  </h2>
                </div>

                <div className="space-y-6 mt-6">
                  <div>
                    <p className="text-gray-500">Homocysteine</p>
                    <p className="text-lg font-semibold">15 mcmol/L</p>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">LDL</p>
                      <p className="text-lg font-semibold">75mg/dl</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col ">
                <div className="mb-20">
                  <p className="text-gray-500">Blood Pressure</p>
                  <p className="text-lg font-semibold">119/70 mm Hg</p>
                </div>

                <div className="text-right">
                  <p className="text-gray-500">HDL</p>
                  <p className="text-lg font-semibold">58mg/dl</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card 3: Troponin Levels */}
        <motion.div variants={itemVariants} className="md:col-span-5">
          <Card className="bg-white rounded-3xl shadow-sm h-full p-6">
            <div>
              <p className="text-gray-500">Troponin Levels</p>
              <p className="text-lg font-semibold">0.03 ng/mL</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-500">Aortic compliance</p>
              <p className="text-lg font-semibold">1.7 mL/mmHg</p>
            </div>

            <div className="flex justify-between mt-10">
              <div>
                <p className="text-gray-500">BNP</p>
                <p className="text-lg font-semibold">50 pg/mL</p>
              </div>

              <div className="text-right">
                <p className="text-gray-500">NT- BNP</p>
                <p className="text-lg font-semibold">420 pg/mL</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card 4: Vessels and Performance */}
        <motion.div variants={itemVariants} className=" md:col-span-7">
          <Card className="bg-white rounded-3xl shadow-sm h-full p-3">
            <div className="flex flex-col md:flex-row w-full items-center  mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Vessels and Performance
              </h2>
              <div className="flex justify-between w-full items-center bg-gray-100 px-5 py-6 rounded-3xl ml-2">
                <p className="text-gray-500 text-sm ">Stroke Volume</p>
                <div>
                  <p className="text-xs font-semibold">70</p>
                  <p className=" text-gray-500 text-xs">sv/ml</p>
                </div>
              </div>

              <div className="flex justify-between w-full items-center bg-gray-100 px-5 py-8 mt-4 md:mt-0 ml-2 rounded-3xl">
                <p className="text-gray-500 text-sm">Ejection Fraction</p>
                <p className="text-xs font-semibold">60%</p>
              </div>
            </div>

            <div className="grid sm:grid-rows-1  md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center bg-gray-100 px-5 py-8 rounded-3xl col-span-2">
                <p className="text-gray-500 text-sm">Pulmonary Veins</p>
                <p className="text-xs font-semibold">2.2 cm</p>
              </div>

              <div className="flex justify-between items-center bg-gray-100 px-5 py-8 rounded-3xl">
                <p className="text-gray-500 text-sm">Ascending Aorta</p>
                <p className="text-xs font-semibold">3 cm</p>
              </div>

              <div className="flex justify-between items-center bg-gray-100 px-5 py-8 rounded-3xl">
                <p className="text-gray-500 text-sm">Superior Vena Cava</p>
                <p className="text-xs font-semibold">2.2 cm</p>
              </div>

              <div className="flex justify-between items-center bg-gray-100 px-5 py-8 rounded-3xl">
                <p className="text-gray-500 text-sm">Inferior Vena Cava</p>
                <p className="text-xs font-semibold">2.7 cm</p>
              </div>

              <div className="flex justify-between items-center bg-gray-100 px-5 py-8 rounded-3xl">
                <p className="text-gray-500 text-sm">Pulmonary Veins</p>
                <p className="text-xs font-semibold">2.6 cm</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Cardiology;
