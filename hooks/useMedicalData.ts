import { useMemo } from 'react'
import {
  PatientData,
  System,
  Test,
  findTestInSystem,
  findTestInSystems,
} from '../types/medical-data'

export const useMedicalData = (data?: PatientData) => {
  // Extract systems using useMemo for performance
  const systems = useMemo(() => {
    if (!data) return {}

    return {
      cardiovascular: data.systems.find((s) => s.name === 'Cardiovascular'),
      renal: data.systems.find((s) => s.name === 'Renal'),
      digestive: data.systems.find((s) => s.name === 'Digestive'),
      metabolic: data.systems.find((s) => s.name === 'Metabolic'),
      neurological: data.systems.find(
        (s) => s.name === 'Neurological / Autonomic',
      ),
      immune: data.systems.find((s) => s.name === 'Immune'),
      musculoskeletal: data.systems.find((s) => s.name === 'Musculoskeletal'),
      respiratory: data.systems.find((s) => s.name === 'Respiratory'),
      endocrine: data.systems.find((s) => s.name === 'Endocrine / Hormonal'),
      hematologic: data.systems.find((s) => s.name === 'Hematologic'),
      reproductive: data.systems.find((s) => s.name === 'Reproductive'),
      integumentary: data.systems.find((s) => s.name === 'Integumentary'),
      skeletal: data.systems.find((s) => s.name === 'Skeletal'),
      cancerRisk: data.systems.find((s) => s.name === 'Cancer Risk'),
      exposome: data.systems.find((s) => s.name === 'Exposome'),
      neurotransmitters: data.systems.find(
        (s) => s.name === 'Neurotransmitters',
      ),
      genomics: data.systems.find((s) => s.name === 'Genomics'),
    }
  }, [data])

  // Helper function to find a test across multiple systems
  const findTest = useMemo(() => {
    return (testName: string, systemNames?: string[]): Test | undefined => {
      if (!data) return undefined

      if (systemNames) {
        const targetSystems = systemNames
          .map((name) => data.systems.find((s) => s.name === name))
          .filter(Boolean) as System[]
        return findTestInSystems(testName, targetSystems)
      }

      // Search all systems
      return findTestInSystems(testName, data.systems)
    }
  }, [data])

  // Cardiovascular helpers
  const cardiovascularData = useMemo(() => {
    const system = systems.cardiovascular
    return {
      system,
      vo2max: findTestInSystem('VO2max', system),
      heartRateVariability: findTestInSystem('Heart Rate Variability', system),
      heartRateRecovery: findTestInSystem('Heart Rate Recovery', system),
      troponin: findTestInSystem('Troponin', system),
      ntProBNP: findTestInSystem('NT-proBNP', system),
      lipids: findTestInSystem('Lipids', system),
      apoB: findTestInSystem('ApoB', system),
      hscrp: findTestInSystem('hs-CRP', system),
      calciumScore: findTestInSystem('CT Calcium Score', system),
      carotidIMT: findTestInSystem('Carotid IMT', system),
      pulseWaveVelocity: findTestInSystem('Pulse Wave Velocity', system),
    }
  }, [systems.cardiovascular])

  // Renal helpers
  const renalData = useMemo(() => {
    const system = systems.renal
    return {
      system,
      egfr: findTestInSystem('eGFR', system),
      creatinine: findTestInSystem('Creatinine', system),
      bun: findTestInSystem('BUN', system),
    }
  }, [systems.renal])

  // Digestive helpers
  const digestiveData = useMemo(() => {
    const system = systems.digestive
    return {
      system,
      liverEnzymes: findTestInSystem('Liver Enzymes', system),
      alt: findTestInSystem('ALT', system),
      ast: findTestInSystem('AST', system),
      bilirubin: findTestInSystem('Bilirubin', system),
      microbiome: findTestInSystem('Microbiome', system),
      nutrientPanel: findTestInSystem('Nutrient Panel', system),
    }
  }, [systems.digestive])

  // Metabolic helpers
  const metabolicData = useMemo(() => {
    const system = systems.metabolic
    return {
      system,
      hba1c: findTestInSystem('HbA1c', system),
      fastingInsulin: findTestInSystem('Fasting Insulin', system),
      cgm: findTestInSystem('Continuous Glucose Monitoring', system),
      visceralFat: findTestInSystem('Visceral Fat', system),
    }
  }, [systems.metabolic])

  // Sleep data from neurological system
  const sleepData = useMemo(() => {
    return findTestInSystem('Sleep', systems.neurological)
  }, [systems.neurological])

  // Get patient info
  const patientInfo = data?.patient

  // Health status calculator
  const getHealthStatus = (
    value: number,
    referenceRange?: { low: number; high: number },
  ) => {
    if (!referenceRange)
      return { status: 'Unknown', color: 'bg-gray-100 text-gray-800' }

    if (value >= referenceRange.low && value <= referenceRange.high) {
      return { status: 'Normal', color: 'bg-green-100 text-green-800' }
    } else if (value < referenceRange.low) {
      return { status: 'Low', color: 'bg-blue-100 text-blue-800' }
    } else {
      return { status: 'High', color: 'bg-red-100 text-red-800' }
    }
  }

  return {
    // Raw data
    data,
    patientInfo,
    systems,

    // Utility functions
    findTest,
    getHealthStatus,

    // System-specific data
    cardiovascularData,
    renalData,
    digestiveData,
    metabolicData,
    sleepData,

    // Computed values
    hasData: !!data,
    systemCount: data?.systems.length || 0,
    testCount:
      data?.systems.reduce((count, system) => count + system.tests.length, 0) ||
      0,
  }
}

// Additional utility functions
export const useCardiovascularMetrics = (data?: PatientData) => {
  const { cardiovascularData, getHealthStatus } = useMedicalData(data)

  return useMemo(() => {
    const vo2max = cardiovascularData.vo2max?.value
    const hrv = cardiovascularData.heartRateVariability?.value
    const troponin = cardiovascularData.troponin?.value

    return {
      vo2max: {
        value: vo2max || 63,
        unit: cardiovascularData.vo2max?.unit || 'mL/kg/min',
        rating: vo2max ? getVO2MaxRating(vo2max) : 'Good',
        status: cardiovascularData.vo2max?.reference_range
          ? getHealthStatus(
              vo2max || 0,
              cardiovascularData.vo2max.reference_range,
            )
          : undefined,
      },
      heartRateVariability: {
        value: hrv || 45,
        unit: cardiovascularData.heartRateVariability?.unit || 'ms',
        status: cardiovascularData.heartRateVariability?.reference_range
          ? getHealthStatus(
              hrv || 0,
              cardiovascularData.heartRateVariability.reference_range,
            )
          : undefined,
      },
      troponin: {
        value: troponin || 0.02,
        unit: cardiovascularData.troponin?.unit || 'ng/mL',
        status: cardiovascularData.troponin?.reference_range
          ? getHealthStatus(
              troponin || 0,
              cardiovascularData.troponin.reference_range,
            )
          : undefined,
      },
    }
  }, [cardiovascularData, getHealthStatus])
}

export const useRenalMetrics = (data?: PatientData) => {
  const { renalData, getHealthStatus } = useMedicalData(data)

  return useMemo(() => {
    const egfr = renalData.egfr?.value
    const creatinine = renalData.creatinine?.value
    const bun = renalData.bun?.value

    return {
      egfr: {
        value: egfr || 117,
        unit: renalData.egfr?.unit || 'mL/min/1.73m²',
        status: getKidneyStatus(egfr || 117),
      },
      creatinine: {
        value: creatinine || 1.2,
        unit: renalData.creatinine?.unit || 'mg/dL',
        status: renalData.creatinine?.reference_range
          ? getHealthStatus(
              creatinine || 0,
              renalData.creatinine.reference_range,
            )
          : undefined,
      },
      bun: {
        value: bun || 29,
        unit: renalData.bun?.unit || 'mg/dL',
        status: renalData.bun?.reference_range
          ? getHealthStatus(bun || 0, renalData.bun.reference_range)
          : undefined,
      },
      bunCreatinineRatio:
        bun && creatinine ? Math.round((bun / creatinine) * 10) / 10 : 24.2,
    }
  }, [renalData, getHealthStatus])
}

// Helper functions
const getVO2MaxRating = (value: number): string => {
  if (value >= 60) return 'Excellent'
  if (value >= 50) return 'Good'
  if (value >= 40) return 'Average'
  if (value >= 30) return 'Below Average'
  return 'Poor'
}

const getKidneyStatus = (egfr: number): { status: string; color: string } => {
  if (egfr >= 90)
    return { status: 'Healthy', color: 'bg-green-100 text-green-800' }
  if (egfr >= 60)
    return { status: 'Mild Decrease', color: 'bg-yellow-100 text-yellow-800' }
  if (egfr >= 30)
    return {
      status: 'Moderate Decrease',
      color: 'bg-orange-100 text-orange-800',
    }
  if (egfr >= 15)
    return { status: 'Severe Decrease', color: 'bg-red-100 text-red-800' }
  return { status: 'Kidney Failure', color: 'bg-red-100 text-red-800' }
}
