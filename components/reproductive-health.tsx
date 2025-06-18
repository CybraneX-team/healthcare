"use client";

import { motion } from "framer-motion";

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

export default function ReproductiveHealth() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full overflow-y-auto md:overflow-y-hidden"
    >
      <div className=" min-h-full p-8">
        {/* Main Content Container */}
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column */}
          <div className="col-span-5 space-y-4">
            {/* Header Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8">
              <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Reproductive Health</h1>
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    Healthy
                  </div>
              </div>
              {/* AMH Section */}
            <motion.div variants={itemVariants} className="">
              <div className="mt-28">
                <h2 className="text-lg font-normal text-gray-900">AMH</h2>
              </div>
              <div className="text-3xl font-bold text-gray-900">3.2 <span className="text-2xl font-normal text-gray-500">ng/mL</span></div>
            </motion.div>
            </motion.div>

            {/* Fertility Section */}
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8">
                <div className="flex justify-between">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">Fertility</h2>
                </div>
                <div className="text-right">
                  <div className="text-xl font-normal text-gray-900">SHBG</div>
                  <div className="text-xl font-bold text-gray-900">47 <span className="text-lg font-normal text-gray-500">nmol/L</span></div>
                </div>
              </div>

              <div className="mt-28">
                {/* SNPs Section */}
                <motion.div variants={itemVariants} className="bg-gray-100 text-center rounded-3xl px-6 py-8 flex items-center justify-center">
                  <div className="flex justify-between items-center w-full">
                    <div className="mb-6">
                      <h2 className="text-md font-normal text-gray-900 mb-1">SNPs</h2>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900 mb-1">CYP19A1</div>
                      <div className="text-sm font-bold text-gray-500 mb-3">RS7005192</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">GA</div>
                      <div className="text-sm text-gray-500">Genotype</div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </motion.div>

            
          </div>

          {/* Right Column - Hormones */}
          <div className="col-span-7">
            <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 h-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Hormones</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Prolactin */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">Prolactin</h3>
                    <p className="text-sm text-gray-500">fertility issues, lactation</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">12 <span className="text-base font-normal text-gray-500">ng/mL</span></div>
                </div>

                {/* Inhibin B */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">Inhibin B</h3>
                    <p className="text-sm text-gray-500">Marker of sperm or egg reserve</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">156 <span className="text-base font-normal text-gray-500">pg/mL</span></div>
                </div>

                {/* Free Testosterone */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">Free Testosterone</h3>
                    <p className="text-sm text-gray-500">fertility issues, lactation</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">550 <span className="text-base font-normal text-gray-500">ng/dL</span></div>
                </div>

                {/* Progesterone */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">Progesterone</h3>
                    <p className="text-sm text-gray-500">Rises after ovulation</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">5 <span className="text-base font-normal text-gray-500">ng/dL</span></div>
                </div>

                {/* FSH */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">FSH</h3>
                    <p className="text-sm text-gray-500">Rises after ovulation</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">6 <span className="text-base font-normal text-gray-500">mIU/mL</span></div>
                </div>

                {/* Estradiol (E2) */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">Estradiol (E2)</h3>
                    <p className="text-sm text-gray-500">Rises after ovulation</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">34 <span className="text-base font-normal text-gray-500">pg/mL</span></div>
                </div>

                {/* LH */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">LH</h3>
                    <p className="text-sm text-gray-500">Surges to trigger ovulation</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">5.6 <span className="text-base font-normal text-gray-500">mIU/mL</span></div>
                </div>

                {/* GnRH */}
                <div className="bg-gray-100 rounded-3xl p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-medium text-gray-700">GnRH</h3>
                    <p className="text-sm text-gray-500">Pulsatile; tested via LH/FSH responses</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">-- <span className="text-base font-normal text-gray-500">mIU/mL</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 