# Data Not Found in JSON

This file logs any data that the components attempted to find in the JSON structure but was not available.

## Heart Component
### ✅ Found in JSON:
- VO2max value (from Cardiovascular system)
- Sleep duration (from Neurological/Autonomic system)

### ❌ Missing from JSON (using static values):
- Total Body Fat percentage (displayed as static 25%)
- Muscle Mass percentage (displayed as static 73%)
- BMI value and height/weight for BMI calculation (displayed as static 20.5)
- Weight trend data for chart visualization (using generated sample data)
- Total Weight (displayed as static 71 Kg)
- Strength Score (displayed as static 6)

## Liver Component
### ✅ Found in JSON:
- ALT levels (from Digestive system)
- AST levels (from Digestive system)
- Bilirubin levels (from Digestive system)
- Microbiome diversity data (from Digestive system)

### ❌ Missing from JSON:
- No missing data - successfully found all required liver metrics

## Kidney Component
### ✅ Found in JSON:
- eGFR (estimated Glomerular Filtration Rate from Renal system)
- Creatinine levels (from Renal system)
- BUN (Blood Urea Nitrogen) levels (from Renal system)

### ❌ Missing from JSON (using static values):
- Uric Acid levels (displayed as static 6.0 mg/dL)
- Urine Albumin levels (displayed as static 20 mcg/minute)
- Urine pH (displayed as static 6.5)
- Hydration level percentage (displayed as static 75%)

## Summary
The dynamic data implementation successfully found and displayed:
- **Heart Component**: 2/8 metrics found in JSON (25% dynamic)
- **Liver Component**: 4/4 metrics found in JSON (100% dynamic)
- **Kidney Component**: 3/7 metrics found in JSON (43% dynamic)

## Last Updated
Updated on: 2024-06-08 

