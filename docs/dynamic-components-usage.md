# Dynamic Organ Components Usage Guide

This guide explains how to use the dynamic organ components with medical data in JSON format.

## Overview

The organ components (Heart, Liver, Kidney) have been updated to accept dynamic data from the provided JSON structure. Each component can now display real patient data instead of hardcoded values.

## Data Structure

The components expect data in the following format:

```typescript
interface PatientData {
  patient: {
    id: string;
    name: string;
    date_of_birth: string;
    sex: "M" | "F" | "O";
    report_date: string;
    source_file: {
      filename: string;
      page: number;
      section_heading: string;
    };
  };
  systems: System[];
}
```

## Updated Components

### 1. Heart Component (`components/heart-component.tsx`)

**Data Sources:**
- Cardiovascular system tests
- Neurological/Autonomic system (for sleep data)

**Key Metrics Displayed:**
- VO2max (from Cardiovascular system)
- Heart Rate Variability (from Cardiovascular system)
- Troponin levels (from Cardiovascular system)
- NT-proBNP (from Cardiovascular system)
- Sleep duration and efficiency (from Neurological/Autonomic system)

**Usage:**
```tsx
import { HeartComponent } from './components/heart-component';
import { samplePatientData } from './data/sample-patient-data';

function MyPage() {
  return <HeartComponent data={samplePatientData} />;
}
```

### 2. Liver Component (`components/liver-component.tsx`)

**Data Sources:**
- Digestive system tests
- Metabolic system tests

**Key Metrics Displayed:**
- ALT levels (from Digestive system)
- AST levels (from Digestive system) 
- Bilirubin levels (from Digestive system)
- Microbiome diversity (from Digestive system)
- Liver status based on enzyme levels

**Usage:**
```tsx
import { LiverComponent } from './components/liver-component';
import { samplePatientData } from './data/sample-patient-data';

function MyPage() {
  return <LiverComponent data={samplePatientData} />;
}
```

### 3. Kidney Component (`components/kidney.tsx`)

**Data Sources:**
- Renal system tests

**Key Metrics Displayed:**
- eGFR (estimated Glomerular Filtration Rate)
- Creatinine levels
- BUN (Blood Urea Nitrogen) levels
- BUN/Creatinine ratio
- Kidney health status

**Usage:**
```tsx
import Kidney from './components/kidney';
import { samplePatientData } from './data/sample-patient-data';

function MyPage() {
  return <Kidney data={samplePatientData} />;
}
```

## System Mappings

The JSON structure includes various medical systems. Here's how they map to components:

| JSON System Name | Component | Key Tests |
|------------------|-----------|-----------|
| Cardiovascular | Heart | VO2max, Heart Rate Variability, Troponin, NT-proBNP |
| Renal | Kidney | eGFR, Creatinine, BUN |
| Digestive | Liver | ALT, AST, Bilirubin, Microbiome |
| Neurological / Autonomic | Heart (sleep data) | Sleep metrics |
| Metabolic | Liver, others | HbA1c, Insulin levels |

## Key Features

### 1. Fallback Values
All components include fallback values so they work even without data:
```typescript
const vo2max = findTest("VO2max")?.value || 63; // Default: 63
```

### 2. Dynamic Status Indicators
Components automatically calculate and display health status based on values:
```typescript
const getVO2MaxRating = (value: number): string => {
  if (value >= 60) return "Excellent";
  if (value >= 50) return "Good";
  // ... more conditions
};
```

### 3. Reference Range Support
Components can use reference ranges when available:
```typescript
reference_range: {
  low: 90,
  high: 120,
  unit: "mL/min/1.73m²"
}
```

### 4. Color-Coded Status
Health status is automatically color-coded:
- Green: Normal/Healthy
- Yellow: Monitor/Caution
- Orange: Moderate concern
- Red: High concern/Abnormal

## Adding New Components

To create a new dynamic organ component:

1. Import the shared types:
```typescript
import { PatientData, OrganComponentProps } from '../types/medical-data';
```

2. Define your component with props:
```typescript
export const NewOrganComponent = ({ data }: OrganComponentProps) => {
  // Component logic
};
```

3. Extract relevant system data:
```typescript
const relevantSystem = data?.systems.find(system => system.name === "SystemName");
```

4. Use helper functions to find tests:
```typescript
const findTest = (testName: string) => {
  return relevantSystem?.tests.find(test => test.test_name === testName);
};
```

## Sample Data

See `data/sample-patient-data.ts` for a complete example of properly structured patient data that works with all dynamic components.

## Error Handling

Components handle missing data gracefully:
- Missing systems return undefined
- Missing tests return undefined  
- All values have fallbacks
- Components render with default values when no data is provided

This ensures the UI remains functional even with incomplete medical data. 