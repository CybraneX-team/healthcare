import { PatientData } from '../types/medical-data';

export const samplePatientData: PatientData = {
  patient: {
    id: "P123456",
    name: "John Doe",
    date_of_birth: "1985-06-15",
    sex: "M",
    report_date: "2024-06-08",
    source_file: {
      filename: "health_report_2024.pdf",
      page: 1,
      section_heading: "Comprehensive Health Assessment"
    }
  },
  systems: [
    {
      name: "Cardiovascular",
      tests: [
        {
          test_name: "Lipids",
          value: 180,
          unit: "mg/dL",
          reference_range: {
            low: 100,
            high: 200,
            unit: "mg/dL"
          },
          date: "2024-06-01",
          sample_type: "blood",
          notes: "Total cholesterol level"
        },
        {
          test_name: "VO2max",
          value: 58,
          unit: "mL/kg/min",
          date: "2024-06-01"
        },
        {
          test_name: "Heart Rate Recovery",
          value: 42,
          unit: "bpm",
          date: "2024-06-01"
        },
        {
          test_name: "Heart Rate Variability",
          value: 48,
          unit: "ms",
          date: "2024-06-01"
        },
        {
          test_name: "Troponin",
          value: 0.01,
          unit: "ng/mL",
          reference_range: {
            low: 0,
            high: 0.04,
            unit: "ng/mL"
          }
        },
        {
          test_name: "NT-proBNP",
          value: 98,
          unit: "pg/mL",
          reference_range: {
            low: 0,
            high: 125,
            unit: "pg/mL"
          }
        }
      ]
    },
    {
      name: "Renal",
      tests: [
        {
          test_name: "eGFR",
          value: 95,
          unit: "mL/min/1.73m²",
          reference_range: {
            low: 90,
            high: 120,
            unit: "mL/min/1.73m²"
          }
        },
        {
          test_name: "Creatinine",
          value: 1.1,
          unit: "mg/dL",
          reference_range: {
            low: 0.7,
            high: 1.3,
            unit: "mg/dL"
          }
        },
        {
          test_name: "BUN",
          value: 18,
          unit: "mg/dL",
          reference_range: {
            low: 7,
            high: 20,
            unit: "mg/dL"
          }
        }
      ]
    },
    {
      name: "Digestive",
      tests: [
        {
          test_name: "Liver Enzymes",
          value: 35,
          unit: "U/L",
          notes: "ALT levels"
        },
        {
          test_name: "AST",
          value: 28,
          unit: "U/L",
          reference_range: {
            low: 10,
            high: 40,
            unit: "U/L"
          }
        },
        {
          test_name: "Bilirubin",
          value: 0.9,
          unit: "mg/dL",
          reference_range: {
            low: 0.2,
            high: 1.2,
            unit: "mg/dL"
          }
        },
        {
          test_name: "Microbiome",
          metrics: {
            diversity_index: 78,
            alpha_diversity: 78
          }
        }
      ]
    },
    {
      name: "Neurological / Autonomic",
      tests: [
        {
          test_name: "Heart Rate Variability",
          value: 48,
          unit: "ms"
        },
        {
          test_name: "Sleep",
          metrics: {
            duration: "7:30",
            efficiency: "88%"
          }
        }
      ]
    },
    {
      name: "Metabolic",
      tests: [
        {
          test_name: "HbA1c",
          value: 5.2,
          unit: "%",
          reference_range: {
            low: 4.0,
            high: 5.6,
            unit: "%"
          }
        },
        {
          test_name: "Fasting Insulin",
          value: 8.5,
          unit: "µIU/mL",
          reference_range: {
            low: 2.6,
            high: 24.9,
            unit: "µIU/mL"
          }
        }
      ]
    },
    {
      name: "Immune",
      tests: [
        {
          test_name: "hs-CRP",
          value: 1.2,
          unit: "mg/L",
          reference_range: {
            low: 0,
            high: 3.0,
            unit: "mg/L"
          }
        }
      ]
    },
    {
      name: "Musculoskeletal",
      tests: [
        {
          test_name: "DEXA",
          metrics: {
            bone_density: 1.15,
            t_score: 0.8
          }
        },
        {
          test_name: "Grip Strength",
          value: 45,
          unit: "kg"
        }
      ]
    }
  ]
};

// Example usage functions
export const getCardiovascularData = (data: PatientData) => {
  return data.systems.find(system => system.name === "Cardiovascular");
};

export const getRenalData = (data: PatientData) => {
  return data.systems.find(system => system.name === "Renal");
};

export const getDigestiveData = (data: PatientData) => {
  return data.systems.find(system => system.name === "Digestive");
};

// Function to validate patient data structure
export const validatePatientData = (data: any): data is PatientData => {
  return (
    data &&
    typeof data === 'object' &&
    data.patient &&
    typeof data.patient.id === 'string' &&
    Array.isArray(data.systems) &&
    data.systems.every((system: any) => 
      system.name && 
      Array.isArray(system.tests)
    )
  );
}; 