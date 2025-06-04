"use client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function Component() {
  return (
    <div className="min-h-screen p-3 sm:p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[600px]"
      >
        {/* Neurology Section - Left Column */}
        <div className="lg:col-span-5 grid grid-rows-1 lg:grid-rows-2 gap-4">
          {/* Top Neurology Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-4 sm:p-6 flex flex-col justify-around">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-6 sm:mb-8 gap-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Neurology
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-3 sm:px-4 py-1 rounded-full text-xs font-medium"
                  >
                    No diagnosed symptoms
                  </Badge>
                </div>

                <div className="mt-8 sm:mt-24">
                  <div className="flex  flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <div className="bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                      Happy
                    </div>
                    <div className="bg-gray-100 px-3 sm:px-4 py-2 rounded-3xl text-gray-600 text-xs sm:text-sm font-medium">
                      Calculate Stress
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4 mt-2">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-gray-600 text-xs sm:text-sm mb-1">
                          PHQ-9
                        </div>
                        <div className="text-2xl sm:text-4xl font-bold text-gray-900">
                          6
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 text-xs sm:text-sm mb-1">
                          GAD-7
                        </div>
                        <div className="text-2xl sm:text-4xl font-bold text-gray-900">
                          5
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Symptoms Log Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-0 bg-white rounded-2xl hover:shadow-md transition-shadow duration-300 h-full">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  Migraine or neurological
                  <br />
                  symptoms log
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      Above high Heart Rate
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      Cholesterol in control in last 30 days
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      Rythmic heartbeat
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Neurotransmitters Section - Right Column */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <Card className="shadow-sm border-0 bg-white rounded-2xl hover:shadow-md transition-shadow duration-300 h-full">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Neurotransmitters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Left Column */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Norepinephrine */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Norepinephrine
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Normal levels
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.02 μM
                    </div>
                  </div>

                  {/* Dopamine */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Dopamine
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Involved in pleasure
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.002 μM
                    </div>
                  </div>

                  {/* Acetylcholine */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Acetylcholine
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Normal levels
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.002 μM
                    </div>
                  </div>

                  {/* Endorphins */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Endorphins
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Endorphin
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.002 μM
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3 sm:space-y-4">
                  {/* Acetylcholine */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Acetylcholine
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Attention, memory, muscle.
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.05 μM{" "}
                      <span className="text-gray-400 text-xs sm:text-sm font-normal">
                        (Varies)
                      </span>
                    </div>
                  </div>

                  {/* Serotonin */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Serotonin
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Low Levels indicates Depression
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.002 μM
                    </div>
                  </div>

                  {/* Glutamate */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      Glutamate
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Crucial for learning and memory
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      2 μM
                    </div>
                  </div>

                  {/* GABA */}
                  <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                    <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                      GABA
                    </div>
                    <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                      Endorphin
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900">
                      0.002 μM
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
