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

const barVariants = {
  hidden: { scaleY: 0 },
  visible: (i) => ({
    scaleY: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: "easeOut"
    }
  })
};

// Type definition for gut health item
interface GutHealthItem {
  name: string;
  value: number;
  height: number;
  color: string;
}

const gutHealthData: GutHealthItem[] = [
  { name: "Amylase", value: 85, height: 60, color: "bg-blue-500" },
  { name: "Maltase", value: 95, height: 85, color: "bg-blue-600" },
  { name: "Protease", value: 40, height: 35, color: "bg-blue-200" },
  { name: "Lactase", value: 88, height: 75, color: "bg-blue-500" },
  { name: "Lipase", value: 70, height: 50, color: "bg-blue-300" },
  { name: "Proteases", value: 90, height: 80, color: "bg-blue-600" },
  { name: "Sucrase", value: 92, height: 82, color: "bg-blue-600" },
  { name: "Occult Blood", value: 45, height: 40, color: "bg-blue-200" }
];

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
          <Card className="shadow-sm border-0 bg-white rounded-3xl h-[200px] md:h-[250px]">
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
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-3 bg-white p-1 rounded-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* ALT Card */}
            <Card className="shadow-sm bg-gray-200 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6 md:h-60">
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

            {/* GGT Card */}
            <Card className="shadow-sm bg-gray-200 border-0 rounded-3xl">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-bold text-gray-800 text-2xl md:text-3xl mb-2">GGT</h3>
                <div className="text-2xl md:text-3xl font-extralight">53 U/L</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Gut Health Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm border-0 bg-white rounded-3xl h-80">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              {/* Left side - Title and Score */}
              <div className="mb-6 md:mb-0 md:mr-8">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">Gut Health</h2>
                <div className="mb-2 md:mt-40">
                  <span className="text-sm text-gray-500">Gut Health Score</span>
                </div>
                <div className="text-4xl md:text-6xl font-bold text-gray-800">65%</div>
              </div>

              {/* Right side - Chart */}
              <div className="flex-1 max-w-2xl">
                <div className="flex items-end md:mt-32 justify-center gap-3 md:gap-4 h-32 md:h-40">
                  {gutHealthData.map((item, index) => (
                    <div key={item.name} className="flex flex-col items-center">
                      {/* Bar */}
                      <div className="relative mb-2 flex items-end" style={{ height: '120px' }}>
                        <motion.div
                          custom={index}
                          variants={barVariants}
                          className={`${item.color} rounded-full origin-bottom`}
                          style={{
                            width: '2.5rem',
                            height: `${item.height}px`,
                            transformOrigin: 'bottom'
                          }}
                        />
                      </div>
                      
                      {/* Label */}
                      <div className="text-xs text-gray-600 text-center leading-tight max-w-[50px]">
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default LiverComponent;