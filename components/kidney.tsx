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

  // Toxins data (heavy metals) - based on Risk Stats
  const toxicBurden = 43;
  const mercury = 5; // μg/L μg/dL
  const cadmium = 1.3; // μg/g
  const lead = 1.6; // μg/dL
  const bpa = 1.5; // ng/mL

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
    <div className="h-full overflow-y-auto md:overflow-y-hidden p-4 text-black md:-mt-3">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4"
      >
        {/* Card 1: Kidney Health and Urine PH */}
        <motion.div variants={itemVariants} className="md:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm h-auto p-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Kidney Health
                </h2>
                <div className="">
                  {/* <span className={`inline-block px-3 py-1 rounded-full text-sm ${kidneyStatus.color}`}>
                    {kidneyStatus.status}
                  </span> */}
                </div>
              </div>

              <div className="text-right p-1">
                <p className="text-gray-500">Urine PH</p>
                <p className="text-3xl font-semibold">{urinePH}</p>
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
            
            <div className="mt-16">
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">{eGFR}</p>
                <p className="text-sm text-gray-500 mt-1">{eGFRUnit}</p>
                <p className="text-gray-500 text-md">Creatine Levels</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Hydration */}
        <motion.div variants={itemVariants} className="md:col-span-4">
          <div className="bg-white rounded-3xl shadow-sm h-[110%] p-8">
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
                </div>
              </div>
              <button className="mt-6 bg-gray-100 text-gray-700 rounded-full py-2 px-4 w-full hover:bg-gray-200 transition-colors">
                Add Water Intake
              </button>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Risks Stats with Random Urine Albumin */}
        <motion.div variants={itemVariants} className="md:col-span-4 -mt-6">
          <div className="bg-white rounded-3xl shadow-sm h-auto p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-8">
              Risks Stats
            </h2>
            
            <div className="mt-24">
              <p className="text-gray-500 text-md mb-4">Random Urine <br/>Albumin</p>
              <div className="mt-2">
                <p className="text-5xl font-semibold text-gray-900">{urineAlbumin}</p>
                <p className="text-sm text-gray-500 font-light mt-2">mcg/minute</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Toxins Data */}
        <motion.div variants={itemVariants} className="md:col-span-4 -mt-6">
          <div className="bg-white rounded-3xl shadow-sm h-auto p-8">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 text-md">Toxins <br/>(heavy metals)</span>
              <div className="text-right flex flex-col">
                <span className="text-gray-500 text-sm">Toxic Burden</span>
                <span className="text-3xl font-bold text-gray-900 ml-4">{toxicBurden}</span>
              </div>
            </div>
            
            <div className="space-y-2 mt-0">
              <div className="flex justify-between items-center p-2 px-4 bg-gray-100 rounded-3xl">
                <span className="text-gray-600 text-md font-medium">Mercury</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-gray-900">{mercury}</span>
                  <span className="text-gray-500 text-sm ml-1">μg/L μg/dL</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 px-4 bg-gray-100 rounded-2xl">
                <span className="text-gray-600 text-md font-medium">Cadmium</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-gray-900">{cadmium}</span>
                  <span className="text-gray-500 text-sm ml-1">μg/g</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 px-4 bg-gray-100 rounded-2xl">
                <span className="text-gray-600 text-md font-medium">Lead</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-gray-900">{lead}</span>
                  <span className="text-gray-500 text-sm ml-1">μg/dL</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-2 px-4 bg-gray-100 rounded-2xl">
                <span className="text-gray-600 text-md font-medium">BPA</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-gray-900">{bpa}</span>
                  <span className="text-gray-500 text-sm ml-1">ng/mL</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 5: BUN Levels and Stats */}
        <motion.div variants={itemVariants} className="md:col-span-4 mt-7">
          <div className="bg-white rounded-3xl shadow-sm h-auto p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <span className="px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-600 font-medium">
                Healthy
              </span>
              <div className="text-right">
                <h3 className="text-lg font-normal text-gray-900">
                  BUN Levels
                </h3>
                <p className="text-lg font-bold text-gray-900">{bun}mg/dl</p>
              </div>
            </div>

            <div className="flex justify-between items-end mt-16">
              <div>
                <p className="text-gray-500">Uric Acid</p>
            <div className="flex">
                  <p className="text-3xl font-semibold text-gray-900">{uricAcid}</p>
                  <p className="text-xl mt-2 ml-1 text-gray-900">mg/dl</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-gray-500 text-sm">eGFR</p>
                <p className="text-3xl font-bold text-gray-900">{eGFR}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Kidney;
