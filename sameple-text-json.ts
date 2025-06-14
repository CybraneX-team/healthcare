export const samplePdfData = {
    "patient": {
      "id": "<string>",
      "name": "<string>",
      "date_of_birth": "<YYYY-MM-DD>",
      "sex": "<M|F|O>",
      "report_date": "<YYYY-MM-DD>",
      "source_file": {
        "filename": "<string>",
        "page": "<integer>",
        "section_heading": "<string>"
      }
    },
    "systems": [
      {
        "name": "Cardiovascular",
        "tests": [
          {
            "test_name": "Lipids",
            "value": "<number>",
            "unit": "<string>",
            "reference_range": {
              "low": "<number>",
              "high": "<number>",
              "unit": "<string>"
            },
            "date": "<YYYY-MM-DD>",
            "sample_type": "blood",
            "notes": "<string>"
          },
          {
            "test_name": "ApoB",
            "value": "<number>",
            "unit": "<string>",
            "reference_range": { "low": "<number>", "high": "<number>", "unit": "<string>" }
          },
          {
            "test_name": "Lp(a)",
            "value": "<number>",
            "unit": "<string>"
          },
          {
            "test_name": "hs-CRP",
            "value": "<number>",
            "unit": "<string>"
          },
          {
            "test_name": "NT-proBNP",
            "value": "<number>",
            "unit": "<string>"
          },
          {
            "test_name": "Troponin",
            "value": "<number>",
            "unit": "<string>"
          },
          {
            "test_name": "CT Calcium Score",
            "value": "<number>",
            "unit": "Agatston"
          },
          {
            "test_name": "Carotid IMT",
            "value": "<number>",
            "unit": "mm"
          },
          {
            "test_name": "Pulse Wave Velocity",
            "value": "<number>",
            "unit": "m/s"
          },
          {
            "test_name": "VO2max",
            "value": "<number>",
            "unit": "mL/kg/min"
          },
          {
            "test_name": "Heart Rate Recovery",
            "value": "<number>",
            "unit": "bpm"
          },
          {
            "test_name": "Heart Rate Variability",
            "value": "<number>",
            "unit": "ms"
          }
        ]
      },
      {
        "name": "Endocrine / Hormonal",
        "tests": [
          { "test_name": "Hormone Panel"},
          {
            "test_name": "IGF-1",
            "value": "<number>",
            "unit": "<string>"
          },
          {
            "test_name": "HbA1c",
            "value": "<number>",
            "unit": "%"
          },
          {
            "test_name": "Genetic SNP",
            "gene": "COMT",
            "variant": "rs4680",
            "genotype": "<string>",
            "zygosity": "<homozygous|heterozygous>"
          }
        ]
      },
      {
        "name": "Metabolic",
        "tests": [
          { "test_name": "Comprehensive Metabolic Panel" },
          {
            "test_name": "HbA1c",
            "value": "<number>",
            "unit": "%"
          },
          {
            "test_name": "Fasting Insulin",
            "value": "<number>",
            "unit": "µIU/mL"
          },
          {
            "test_name": "Continuous Glucose Monitoring",
            "metrics": {
              "avg_glucose": "<number>",
              "time_in_range": "<string>"
            }
          },
          {
            "test_name": "Visceral Fat",
            "value": "<number>",
            "unit": "cm²"
          },
          {
            "test_name": "Genetic SNP",
            "gene": "FTO",
            "variant": "rs9939609",
            "genotype": "<string>"
          }
        ]
      },
      {
        "name": "Immune",
        "tests": [
          { "test_name": "Complete Blood Count" },
          {
            "test_name": "hs-CRP",
            "value": "<number>",
            "unit": "mg/L"
          },
          {
            "test_name": "Homocysteine",
            "value": "<number>",
            "unit": "µmol/L"
          },
          {
            "test_name": "Microbiome",
            "metrics": {
              "alpha_diversity": "<number>",
              "beta_diversity": "<string>"
            }
          },
          {
            "test_name": "Environmental Toxin",
            "toxin": "Glyphosate",
            "matrix": "urine",
            "value": "<number>",
            "unit": "<string>"
          }
        ]
      },
      {
        "name": "Musculoskeletal",
        "tests": [
          {
            "test_name": "DEXA",
            "metrics": {
              "bone_density": "<number>",
              "t_score": "<number>"
            }
          },
          {
            "test_name": "Grip Strength",
            "value": "<number>",
            "unit": "kg"
          },
          {
            "test_name": "MRI",
            "finding": "<string>"
          },
          {
            "test_name": "Range of Motion",
            "joint": "<string>",
            "degrees": "<number>"
          },
          {
            "test_name": "Functional Movement Screen",
            "score": "<number>"
          },
          {
            "test_name": "Genetic SNP",
            "gene": "VDR",
            "variant": "rs2228570",
            "genotype": "<string>"
          }
        ]
      },
      {
        "name": "Respiratory",
        "tests": [
          {
            "test_name": "VO2max",
            "value": "<number>",
            "unit": "mL/kg/min"
          },
          {
            "test_name": "Heart Rate Recovery",
            "value": "<number>",
            "unit": "bpm"
          },
          {
            "test_name": "SpO2 at Effort",
            "value": "<number>",
            "unit": "%"
          }
        ]
      },
      {
        "name": "Neurological / Autonomic",
        "tests": [
          { "test_name": "Heart Rate Variability", "value": "<number>", "unit": "ms" },
          { "test_name": "Sleep", "metrics": { "duration": "<HH:MM>", "efficiency": "<%>" } },
          { "test_name": "Gait Analysis", "findings": "<string>" },
          {
            "test_name": "Neurotransmitters",
            "panel": {
              "serotonin": "<number>",
              "dopamine": "<number>",
              "GABA": "<number>"
            }
          },
          {
            "test_name": "Genetic SNP",
            "gene": "MAO-A",
            "variant": "rs6323",
            "genotype": "<string>"
          }
        ]
      },
      {
        "name": "Digestive",
        "tests": [
          { "test_name": "Liver Enzymes"},
          {
            "test_name": "Microbiome",
            "metrics": { "diversity_index": "<number>" }
          },
          {
            "test_name": "Nutrient Panel"
          },
          {
            "test_name": "Environmental Toxin",
            "toxin": "BPA",
            "matrix": "urine",
            "value": "<number>"
          }
        ]
      },
      {
        "name": "Renal",
        "tests": [
          {
            "test_name": "eGFR",
            "value": "<number>",
            "unit": "mL/min/1.73m²"
          },
          {
            "test_name": "Creatinine",
            "value": "<number>",
            "unit": "mg/dL"
          },
          {
            "test_name": "BUN",
            "value": "<number>",
            "unit": "mg/dL"
          }
        ]
      },
      {
        "name": "Hematologic",
        "tests": [
          { "test_name": "Hemoglobin", "value": "<number>", "unit": "g/dL" },
          { "test_name": "Ferritin", "value": "<number>", "unit": "ng/mL" },
          { "test_name": "Platelets", "value": "<number>", "unit": "10^3/µL" },
          {
            "test_name": "Genetic SNP",
            "gene": "HFE",
            "variant": "rs1800562",
            "genotype": "<string>"
          }
        ]
      },
      {
        "name": "Skeletal",
        "tests": [
          {
            "test_name": "Bone Density",
            "site": "<string>",
            "value": "<number>",
            "unit": "g/cm²"
          },
          { "test_name": "Posture", "assessment": "<string>" },
          { "test_name": "Range of Motion", "joint": "<string>", "degrees": "<number>" },
          {
            "test_name": "Environmental Toxin",
            "toxin": "Cadmium",
            "matrix": "blood",
            "value": "<number>"
          }
        ]
      },
      {
        "name": "Reproductive",
        "tests": [
          { "test_name": "FSH", "value": "<number>", "unit": "mIU/mL" },
          { "test_name": "LH", "value": "<number>", "unit": "mIU/mL" },
          {
            "test_name": "Genetic SNP",
            "gene": "CYP19A1",
            "variant": "rs700519",
            "genotype": "<string>"
          }
        ]
      },
      {
        "name": "Integumentary",
        "tests": [
          {
            "test_name": "Methylation Age",
            "value": "<number>",
            "unit": "years"
          },
          {
            "test_name": "Genetic SNP",
            "gene": "MMP1",
            "variant": "rs1799750",
            "genotype": "<string>"
          },
          {
            "test_name": "Environmental Toxin",
            "toxin": "Arsenic",
            "matrix": "urine",
            "value": "<number>"
          }
        ]
      },
      {
        "name": "Cancer Risk",
        "tests": [
          {
            "test_name": "Galleri (GRAIL)",
            "result": "<positive|negative>",
            "notes": "<string>"
          },
          {
            "test_name": "Polygenic Risk Score",
            "cancer_type": "<string>",
            "score": "<number>"
          },
          {
            "test_name": "Genetic SNP",
            "gene": "BRCA1",
            "variant": "rs80358045",
            "genotype": "<string>"
          }
        ]
      },
      {
        "name": "Exposome",
        "tests": [
          {
            "test_name": "Environmental Toxin",
            "toxin": "Phthalates",
            "matrix": "urine",
            "value": "<number>"
          },
          {
            "test_name": "Environmental Toxin",
            "toxin": "VOCs",
            "matrix": "urine",
            "value": "<number>"
          }
        ]
      },
      {
        "name": "Neurotransmitters",
        "tests": [
          {
            "test_name": "Urine Neurotransmitters",
            "panel": {
              "serotonin": "<number>",
              "dopamine": "<number>",
              "norepinephrine": "<number>",
              "GABA": "<number>",
              "glutamate": "<number>"
            }
          }
        ]
      },
      {
        "name": "Genomics",
        "tests": [
          {
            "test_name": "Detox SNP",
            "gene": "GST",
            "variant": "<rsID>",
            "genotype": "<string>"
          },
          {
            "test_name": "Hormone SNP",
            "gene": "COMT",
            "variant": "<rsID>",
            "genotype": "<string>"
          },
          {
            "test_name": "Metabolism SNP",
            "gene": "MTHFR",
            "variant": "rs1801133",
            "genotype": "<string>"
          }
        ]
      }
    ]
  }
  