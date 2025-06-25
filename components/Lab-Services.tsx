import { useState } from 'react'
import { LabsSection } from './labSection'
import { ServicesProductsSection } from './ServicesSection'

export const CombinedLabsSection = () => {
  const [showServices, setShowServices] = useState(false)

  return (
    <div className="px-6 bg-gradient-to-b from-gray-200 to-white min-h-screen -mt-12">
      {/* Toggle switch between Labs and Services */}
      <div className="flex justify-center my-4 mt-14">
        <div className="flex bg-gray-100 rounded-lg p-1 overflow-hidden">
          <button
            className={`rounded-lg px-6 py-2 ${
              !showServices ? 'bg-blue-500 text-white' : 'text-gray-700'
            } text-sm transition-colors duration-300`}
            onClick={() => setShowServices(false)}
          >
            Diagnostics
          </button>
          <button
            className={`rounded-lg px-6 py-2 ${
              showServices ? 'bg-blue-500 text-white' : 'text-gray-700'
            } text-sm transition-colors duration-300`}
            onClick={() => setShowServices(true)}
          >
            Interventions
          </button>
        </div>
      </div>

      {/* Content container with smooth transition */}
      <div className="transition-opacity duration-300">
        {showServices ? <ServicesProductsSection /> : <LabsSection />}
      </div>
    </div>
  )
}
