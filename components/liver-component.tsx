"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut" }
  },
  exit: {
    y: -15, 
    opacity: 0,
    transition: { duration: 0.25, ease: "easeIn" }
  }
};

// Type definition for gut health item
interface GutHealthItem {
  name: string;
  value: number;
}

export const LiverComponent = () => {
  return (
    <motion.div 
      className="w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Liver Care Card */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-0 bg-white rounded-3xl h-[200px] md:h-[250px]">
            <CardContent className="p-4 md:p-6">
              <h3 className="font-medium text-gray-800 text-lg">Liver Care</h3>
              <div className="mt-16 md:mt-28">
                <div className="text-gray-500 text-sm">Fatty Liver</div>
                <div className="text-2xl font-semibold mt-1">Grade III</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Results Cards - spans 3 columns on larger screens */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-3 bg-white p-3 rounded-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* ALT Card */}
            <Card className="shadow-sm bg-gray-200 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6 h-56">
                <h3 className="font-bold text-gray-800 text-2xl md:text-3xl mb-0">ALT</h3>
                <div className="text-2xl md:text-3xl font-extralight mt-2">80 U/L</div>
              </CardContent>
            </Card>

            {/* AST Card */}
            <Card className="shadow-sm bg-gray-200 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold text-gray-800 text-2xl md:text-3xl mb-2">AST</h3>
                <div className="text-2xl md:text-3xl font-extralight">35 U/L</div>
              </CardContent>
            </Card>

            {/* Bilirubin Card */}
            <Card className="shadow-sm bg-gray-200 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-gray-800 text-lg mb-2">Bilirubin</h3>
                <div className="text-2xl md:text-3xl font-semibold">1.3 mg/dl</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Gut Health Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-0 bg-white rounded-3xl w-full min-h-[460px]">
          <CardContent className="p-4 md:p-6 lg:p-10">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:w-1/4">
                <h3 className="font-bold text-gray-800 text-xl mb-6">Gut Health</h3>
                
                {/* Gut Health Score */}
                <div className="mt-8 lg:mt-64">
                  <div className="text-gray-500 text-sm mb-1">Gut Health Score</div>
                  <div className="text-4xl md:text-5xl lg:text-6xl font-semibold">65%</div>
                </div>
              </div>
              
              {/* Gut Health Visualization */}
              <div className="flex items-end justify-between h-72 md:h-80 lg:h-96 w-full lg:ml-20 mt-6 lg:mt-0 overflow-x-auto pb-4">
                {[
                  { name: 'Elastase-1', value: 90 },
                  { name: 'Elastase-1', value: 40 },
                  { name: 'Calprotectin', value: 60 },
                  { name: 'Secretory IgA', value: 50 },
                  { name: 'Anti-Gliadin IgA', value: 70 },
                  { name: 'Eosinophil Protein', value: 75 },
                  { name: 'Occult Blood', value: 55 },
                  { name: 'Beta-Glucuronidase', value: 30 }
                ].map((item: GutHealthItem, index: number) => {
                  // Determine color intensity based on value
                  let colorIntensity: number;
                  if (item.value >= 80) {
                    colorIntensity = 600;
                  } else if (item.value >= 70) {
                    colorIntensity = 500;
                  } else if (item.value >= 60) {
                    colorIntensity = 400;
                  } else if (item.value >= 50) {
                    colorIntensity = 300;
                  } else if (item.value >= 40) {
                    colorIntensity = 200;
                  } else if (item.value >= 30) {
                    colorIntensity = 100;
                  } else {
                    colorIntensity = 50;
                  }
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="flex flex-col items-center flex-shrink-0" 
                      style={{ width: 'calc(12.5% - 8px)', minWidth: '60px' }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: "auto", 
                        opacity: 1,
                        transition: { 
                          delay: index * 0.05,
                          duration: 0.4
                        }
                      }}
                    >
                      <div className="w-full flex justify-center">
                        <div className="w-10 sm:w-12 md:w-16 h-64 md:h-72 lg:h-80 flex items-end rounded-full bg-gray-100">
                          <motion.div 
                            className={`w-full bg-blue-${colorIntensity} rounded-full`} 
                            initial={{ height: 0 }}
                            animate={{ 
                              height: `${item.value}%`,
                              transition: {
                                delay: index * 0.05 + 0.1,
                                duration: 0.6,
                                ease: "easeOut"
                              }
                            }}
                          ></motion.div>
                        </div>
                      </div>
                      <div className="text-xs mt-2 text-gray-500 text-center w-full" style={{ minHeight: '2.5rem' }}>
                        {item.name}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default LiverComponent;