 export type PatientData = {
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
};

type System = {
  name: string;
  tests: Test[];
};

type Test = {
  test_name: string;
  value?: number | string;
  unit?: string;
  reference_range?: ReferenceRange;
  date?: string;
  sample_type?: string;
  notes?: string;
  metrics?: { [key: string]: number | string };
};

type ReferenceRange = {
  low: number;
  high: number;
  unit: string;
};
