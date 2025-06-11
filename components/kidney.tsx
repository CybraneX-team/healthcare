import React from "react";
import { motion } from "framer-motion";

// Interface for medical data
interface Test {
  test_name: string;
  value?: number;
  unit?: string;
  reference_range?: {
    low: number;
    high: number;
    unit: string;
  };
  date?: string;
  sample_type?: string;
  notes?: string;
  metrics?: Record<string, any>;
}

interface System {
  name: string;
  tests: Test[];
}

interface PatientData {
  patient: {
    id: string;
    name: string;
    date_of_birth: string;
    sex: string;
    report_date: string;
    source_file: {
      filename: string;
      page: number;
      section_heading: string;
    };
  };
  systems: System[];
}

interface KidneyProps {
  data?: PatientData;
}

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

const Kidney = ({ data }: KidneyProps) => {
  // Extract renal system data
  const renalSystem = data?.systems.find(system => system.name === "Renal");
  
  // Helper function to find a test by name
  const findTest = (testName: string): Test | undefined => {
    return renalSystem?.tests.find(test => test.test_name === testName);
  };

  // Extract specific test values with fallbacks
  const eGFR = findTest("eGFR")?.value || 117;
  const eGFRUnit = findTest("eGFR")?.unit || "mL/min/1.73m²";
  
  const creatinine = findTest("Creatinine")?.value || 1.2;
  const creatinineUnit = findTest("Creatinine")?.unit || "mg/dL";
  
  const bun = findTest("BUN")?.value || 29;
  const bunUnit = findTest("BUN")?.unit || "mg/dL";

  // Calculate BUN/Creatinine ratio
  const bunCreatinineRatio = Math.round((bun / creatinine) * 10) / 10;

  // Mock values for additional kidney health indicators
  const uricAcid = 6.0; // This could come from metabolic system
  const urineAlbumin = 20; // This could come from urine tests
  const urinePH = 6.5;

  // Determine kidney health status
  const getKidneyStatus = (egfr: number): { status: string; color: string } => {
    if (egfr >= 90) return { status: "Healthy", color: "bg-green-100 text-green-800" };
    if (egfr >= 60) return { status: "Mild Decrease", color: "bg-yellow-100 text-yellow-800" };
    if (egfr >= 30) return { status: "Moderate Decrease", color: "bg-orange-100 text-orange-800" };
    if (egfr >= 15) return { status: "Severe Decrease", color: "bg-red-100 text-red-800" };
    return { status: "Kidney Failure", color: "bg-red-100 text-red-800" };
  };

  const kidneyStatus = getKidneyStatus(eGFR);

  // Hydration level (mock data - could be calculated from various factors)
  const hydrationLevel = 75; // percentage

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
          <div className="bg-white rounded-3xl shadow-sm h-full p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl md:text-3xl font-semibold text-gray-900 mb-4">
                  Kidney Health
                </h2>
                <div className="">
                  {/* <span className={`inline-block px-3 py-1 rounded-full text-sm ${kidneyStatus.color}`}>
                    {kidneyStatus.status}
                  </span> */}
                </div>
                <p className="text-gray-500 mt-24">Random Urine Albumin</p>
                <div className="mt-2">
                  <p className="text-2xl font-semibold">{urineAlbumin}</p>
                  <p className="text-xl text-black font-light">mcg/minute</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-500">Urine PH</p>
                <p className="text-2xl font-semibold">{urinePH}</p>
                <div className="mt-2">
                  {/* <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    urinePH >= 6.0 && urinePH <= 7.0 ? "bg-green-100 text-green-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {urinePH >= 6.0 && urinePH <= 7.0 ? "Normal" : "Monitor"}
                  </span> */}
                </div>
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
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * hydrationLevel) / 100}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-semibold">{hydrationLevel}%</span>
                  </div>
                </div>
              </div>
              <button className="mt-6 bg-gray-100 text-gray-700 rounded-full py-2 px-4 w-full hover:bg-gray-200 transition-colors">
                Add Water Intake
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 3: BUN Creatinine ratio */}
        <motion.div variants={itemVariants} className="md:col-span-7">
          <div className="bg-white rounded-3xl shadow-sm h-full p-8">
            <h2 className="text:xl md:text-2xl font-semibold text-gray-900 mb-4">
              BUN Creatinine Ratio
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
                <div 
                  className="bg-blue-600 w-full rounded-full transition-all duration-500"
                  style={{ height: `${Math.min((creatinine / 2) * 100, 100)}%` }}
                ></div>
              </div>
              <div 
                className="bg-blue-200 h-32 flex-grow rounded-2xl transition-all duration-500"
                style={{ height: `${Math.min((bun / 50) * 100, 100)}%` }}
              ></div>
            </div>
            <div>
              <p className="text-2xl font-semibold">{eGFR}</p>
              <p className="text-gray-500 text-sm">{eGFRUnit}</p>
              <p className="text-gray-500 mt-2 text-lg">eGFR</p>
              <div className="mt-2">
                {/* <span className={`inline-block px-2 py-1 rounded-full text-xs ${kidneyStatus.color}`}>
                  {kidneyStatus.status}
                </span> */}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: BUN Levels and Stats */}
        <motion.div variants={itemVariants} className="md:col-span-5 ">
          <div className="bg-white rounded-3xl shadow-sm h-full p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              {/* <span className={`px-4 py-1 rounded-full text-sm ${
                bun <= 20 ? "bg-green-100 text-green-500" :
                bun <= 40 ? "bg-yellow-100 text-yellow-500" :
                "bg-red-100 text-red-500"
              }`}>
                {bun <= 20 ? "Healthy" : bun <= 40 ? "Monitor" : "Elevated"}
              </span> */}
              <div className="text-right">
                <h3 className="md:text-xl font-semibold text-gray-900">
                  BUN Levels
                </h3>
                <p className="text-xl font-light">{bun} {bunUnit}</p>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="md:text-2xl font-semibold">{uricAcid} mg/dL</p>
                <p className="text-xl text-gray-900">Uric Acid Levels</p>
                <div className="mt-2">
                  {/* <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    uricAcid <= 7.0 ? "bg-green-100 text-green-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {uricAcid <= 7.0 ? "Normal" : "Elevated"}
                  </span> */}
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-500">Creatinine</p>
                <p className="text-4xl font-semibold">{creatinine}</p>
                <p className="text-gray-500 text-sm">{creatinineUnit}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Kidney;
