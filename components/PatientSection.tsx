'use client'

import { useState } from 'react'
import {
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  Beaker,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const patients = [
  {
    id: 'patient-001',
    name: 'Santiago Zuleta',
    address: '1531 Sunset Dr. Winter Park, FL 32789',
    dob: '2/8/1983',
    phone: '(813) 376-6305',
    email: 'santiagoz@qualisconcrete.com',
    tests: [
      { name: 'Inside Tracker', status: 'Completed', date: '2025-05-06' },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Completed',
        date: '2025-05-01',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Completed',
        date: '2025-04-28',
      },
      {
        name: 'CT Abdomen and Pelvis',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Calcium Score',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Coronary Angiogram (CTA)',
        status: 'Scheduled',
        date: '2025-05-15',
      },
    ],
  },
  {
    id: 'patient-002',
    name: 'Ryan Cole',
    address: '4324 Ciano Court, Export, PA 15632',
    dob: '3/3/1985',
    phone: '(724) 771-9267',
    email: 'ryan@drbillcole.com',
    tests: [],
  },
  {
    id: 'patient-003',
    name: 'George Lemieux',
    address: '147 Pond Meadow Road, Killingworth, CT 06419',
    dob: '12/20/1966',
    phone: '(203) 410-8943',
    email: 'glemieux@lemieuxassociates.com',
    tests: [
      {
        name: 'Methyl Detox Profiling',
        status: 'Completed',
        date: '2025-05-06',
      },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Scheduled',
        date: '2025-05-03',
      },
    ],
  },
  {
    id: 'patient-004',
    name: 'Roberto Sanchez',
    address: '75-933 Hiona St Holualoa, Hawaii 96725',
    dob: '1/17/1979',
    phone: '(512) 633-9170',
    email: 'robsanchez79@gmail.com',
    tests: [],
  },
  {
    id: 'patient-005',
    name: 'Michael Clarke',
    address: '24792 Brown Latigo Street, Malibu, CA 90265',
    dob: '12/6/1966',
    phone: '(310) 877-4393',
    email: 'mclarke@lemieuxassociates.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-04',
      },
    ],
  },
  {
    id: 'patient-006',
    name: 'Rick Valentine',
    address: '890 Antilla Way, San Marcos, CA 92078',
    dob: '12/28/1976',
    phone: '(619) 743-6000',
    email: 'rick@rickvalentine.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'Function Bloodwork Follow-Up',
        status: 'Completed',
        date: '2025-05-10',
      },
      {
        name: 'CT Chest',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Grail Test',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'VO2 Max Testing',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: "Men's Health Lab Panel",
        status: 'Scheduled',
        date: '2025-05-15',
      },
    ],
  },
  {
    id: 'patient-007',
    name: 'Maria Amparo Zuleta',
    address: '2201 Via Esmarca, Oceanside, CA 92054',
    dob: '4/14/1950',
    phone: '(251) 391-5361',
    email: 'amparodezuleta@gmail.com',
    tests: [
      { name: 'Inside Tracker', status: 'Completed', date: '2025-05-02' },
      {
        name: 'Methyl Detox Profiling',
        status: 'Completed',
        date: '2025-04-29',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Lumbar w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Thoracic w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'CT Chest',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Calcium Score',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Grail Test',
        status: 'Scheduled',
        date: '2025-05-15',
      },
    ],
  },
  {
    id: 'patient-008',
    name: 'MaryAlexandra Zuleta',
    address: '7009 El fuerte, Carlsbad CA 92009',
    dob: '5/15/1983',
    phone: '(646) 565-0976',
    email: 'maryalexandra25@gmail.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Pelvis w & w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w & w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      { name: 'CT Chest', status: 'Completed', date: '2025-05-01' },
      { name: 'Ct Cardiac', status: 'Completed', date: '2025-04-28' },
      { name: 'Grail Test', status: 'Scheduled', date: '2025-05-10' },
    ],
  },
  {
    id: 'patient-009',
    name: 'Raphael Akobundu',
    address: '3524 Corte Delfinio Carlsbad CA 92009',
    dob: '9/10/1988',
    phone: '(646) 463-4847',
    email: 'Uzoma51@gmail.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      { name: 'CT Chest', status: 'Completed', date: '2025-04-30' },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      {
        name: 'Calcium Score',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'Coronary Angiogram (CTA)',
        status: 'Scheduled',
        date: '2025-05-15',
      },
    ],
  },
  {
    id: 'patient-010',
    name: 'Liza Zuleta',
    address: '1531 Sunset Dr. Winter Park, FL 32789',
    dob: '5/19/1986',
    phone: '(305) 766-7811',
    email: 'larangoh1986@gmail.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'Function Bloodwork Follow-Up',
        status: 'Completed',
        date: '2025-04-29',
      },
    ],
  },
  {
    id: 'patient-011',
    name: 'Justin Paxton',
    address: '18235 Hartland Street, Reseda, CA 91335',
    dob: '9/14/1988',
    phone: '(434) 249-9921',
    email: 'justin@rogershollow.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
    ],
  },
  {
    id: 'patient-012',
    name: 'Jeffrey Everage',
    address: '906 Elmview Dr, Encinitas, CA 92024',
    dob: '5/14/1969',
    phone: '(619) 254-9571',
    email: 'Jeff@Tridentproposals.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'Function Bloodwork Follow-Up',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Pelvis w & w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'Methyl Detox Profiling',
        status: 'Completed',
        date: '2025-04-24',
      },
      { name: 'CT Chest', status: 'Completed', date: '2025-04-27' },
      { name: 'CT Cardiac', status: 'Completed', date: '2025-04-27' },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      {
        name: 'Coronary Angiogram (CTA)',
        status: 'Completed',
        date: '2025-04-27',
      },
    ],
  },
  {
    id: 'patient-013',
    name: 'Dr Punit Patel',
    address: '11828 Glenhope Rd, San Diego, CA 92128',
    dob: '7/9/1989',
    phone: '(408) 889-3145',
    email: 'patelp07@gmail.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-15',
      },
      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      { name: 'CT Cardiac', status: 'Completed', date: '2025-04-27' },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      { name: 'Grail Test', status: 'Completed', date: '2025-04-27' },
    ],
  },
  {
    id: 'patient-014',
    name: 'Gabriel Briones',
    address: '527 Grimsby Ave, Henderson, NV 89014',
    dob: '7/3/1990',
    phone: '(559) 362-7034',
    email: 'gabrielbriones1990@gmail.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'Methyl Detox Profiling',
        status: 'Completed',
        date: '2025-04-29',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },

      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      { name: 'CT Chest', status: 'Completed', date: '2025-04-27' },
      { name: 'CT Cardiac', status: 'Completed', date: '2025-04-27' },
      { name: 'Calcium Score', status: 'Completed', date: '2025-04-25' },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      {
        name: 'Grail Test',
        status: 'Completed',
        date: '2025-04-22',
      },
      { name: 'VO2 Max Testing', status: 'Scheduled', date: '2025-05-10' },
    ],
  },
  {
    id: 'patient-015',
    name: 'Randall Grizzle',
    address: '2364 S Grinberg Pl Boise, ID 83642',
    dob: '9/1/1978',
    phone: '(208) 440-3231',
    email: 'randall@closersecrets.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },

      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      { name: 'CT Chest', status: 'Completed', date: '2025-04-27' },
      { name: 'Calcium Score', status: 'Completed', date: '2025-04-25' },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      {
        name: 'Grail Test',
        status: 'Completed',
        date: '2025-04-22',
      },
      { name: 'VO2 Max Testing', status: 'Scheduled', date: '2025-05-10' },
    ],
  },
  {
    id: 'patient-016',
    name: 'Taremeredzwa Mutepfa',
    address: '1222 NW 18th Ave Apt 519 Portland, OR 97209',
    dob: '8/16/1987',
    phone: '(503) 867-5472',
    email: 'tare@raramastrong.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      { name: 'VO2 Max Testing', status: 'Scheduled', date: '2025-05-10' },
    ],
  },
  {
    id: 'patient-017',
    name: 'Deborah Marie Burris',
    address: '2724 E Preston St Mesa, AZ 85213',
    dob: '6/30/1967',
    phone: '(480) 203-3246',
    email: 'dburris@me.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      {
        name: 'Methyl Detox Profiling',
        status: 'Completed',
        date: '2025-04-29',
      },
      {
        name: 'MRI Brain w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },

      {
        name: 'MRI Pelvis w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Abdomen w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-12',
      },
      {
        name: 'MRI Pelvis w & w/o Contrast',
        status: 'Scheduled',
        date: '2025-05-10',
      },
      { name: 'CT Chest', status: 'Completed', date: '2025-04-27' },
      { name: 'Calcium Score', status: 'Completed', date: '2025-04-25' },
      {
        name: 'Total Body Composition Scan (TBC)',
        status: 'Completed',
        date: '2025-04-27',
      },
      {
        name: 'Grail Test',
        status: 'Completed',
        date: '2025-04-22',
      },
      { name: 'VO2 Max Testing', status: 'Scheduled', date: '2025-05-10' },
      { name: 'RMR', status: 'Completed', date: '2025-04-27' },
    ],
  },
  {
    id: 'patient-018',
    name: 'Rohan Sheth',
    address: '2650 143A St Surrey, BC V4P 1R6 Canada',
    dob: '5/9/1989',
    phone: '(778) 891-4145',
    email: 'rohan@growrev.com',
    tests: [
      { name: 'VO2 Max Testing', status: 'Scheduled', date: '2025-05-10' },
    ],
  },
  {
    id: 'patient-019',
    name: 'Paul Melville',
    address: '12152 Creek Preserve Dr Riverview, FL 33579',
    dob: '3/14/1972',
    phone: '(813) 938-0227',
    email: 'gci.melville@gmail.com',
    tests: [
      {
        name: 'Function Bloodwork Part 1',
        status: 'Completed',
        date: '2025-05-03',
      },
      {
        name: 'Function Bloodwork Part 2',
        status: 'Completed',
        date: '2025-04-30',
      },
      { name: 'Grail Test', status: 'Scheduled', date: '2025-05-15' },
      {
        name: "Men's Health Lab Panel",
        status: 'Scheduled',
        date: '2025-05-15',
      },
    ],
  },
  {
    id: 'patient-020',
    name: 'Rohit Sheth',
    address: '',
    dob: '',
    phone: '(778) 223-5874',
    email: '',
    tests: [
      { name: 'VO2 Max Testing', status: 'Scheduled', date: '2025-05-10' },
    ],
  },
]

// Test categories mapping
const testCategories = {
  'Inside Tracker': 'Bloodwork',
  'Bloodwork Function': 'Bloodwork',
  'Bloodwork Part 1': 'Bloodwork',
  'Bloodwork Part 2': 'Bloodwork',
  'Bloodwork Follow-Up': 'Bloodwork',
  'Methyl Detox Profiling': 'Genetics',
  'MRI Brain w/o Contrast': 'Radiology',
  'MRI Pelvis w/o Contrast': 'Radiology',
  'MRI Abdomen w/o Contrast': 'Radiology',
  'MRI Pelvis w & w/o Contrast': 'Radiology',
  'MRI Abdomen w & w/o Contrast': 'Radiology',
  'MRI Lumbar w/o Contrast': 'Radiology',
  'MRI Thoracic w/o Contrast': 'Radiology',
  'CT Chest': 'Radiology',
  'CT Cardiac': 'Radiology',
  'CT Abdomen and Pelvis': 'Radiology',
  'Calcium Score': 'Cardiology',
  'Total Body Composition Scan (TBC)': 'Fitness',
  'Grail Test': 'Oncology',
  'VO2 Max Testing': 'Fitness',
  RMR: 'Fitness',
  'Coronary Angiogram (CTA)': 'Cardiology',
  '2D Echo': 'Cardiology',
  "Men's Health Lab Panel": 'Bloodwork',
}

export function PatientSection() {
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(
    null,
  )
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleExpand = (id: string) => {
    if (expandedPatientId === id) {
      setExpandedPatientId(null)
    } else {
      setExpandedPatientId(id)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        patient.name.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.tests.some((test) => test.name.toLowerCase().includes(query))
      )
    }

    // Filter by test category
    if (activeFilter !== 'all') {
      return patient.tests.some(
        (test) =>
          testCategories[
            test.name as keyof typeof testCategories
          ]?.toLowerCase() === activeFilter.toLowerCase(),
      )
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Function to render a single patient card
  const renderPatientCard = (patient: any) => {
    const isExpanded = expandedPatientId === patient.id
    const completedTests = patient.tests.filter(
      (test: any) => test.status.toLowerCase() === 'completed',
    ).length
    const scheduledTests = patient.tests.filter(
      (test: any) => test.status.toLowerCase() === 'scheduled',
    ).length

    return (
      <div key={patient.id} className="mb-6">
        <Card
          className={`overflow-hidden transition-all duration-300 hover:shadow-md ${
            isExpanded ? 'border-blue-200' : ''
          }`}
        >
          <CardContent className="p-0">
            <div className={`p-5 ${isExpanded ? 'bg-blue-50' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-black">
                    {patient.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>DOB: {patient.dob}</span>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {completedTests + scheduledTests} Tests
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {patient.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-5 text-gray-400" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 md:col-span-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{patient.address}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-green-200 text-green-700 bg-green-50"
                  >
                    <Activity className="h-3 w-3 text-green-600" />
                    <span>{completedTests} Completed</span>
                  </Badge>
                  {scheduledTests > 0 && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-blue-200 text-blue-700 bg-blue-50"
                    >
                      <Calendar className="h-3 w-3 text-blue-600" />
                      <span>{scheduledTests} Scheduled</span>
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-8"
                  onClick={() => toggleExpand(patient.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div className="p-5 border-t border-gray-100 bg-white">
                <h4 className="font-medium mb-3 flex items-center text-black">
                  <Beaker className="h-4 w-4 mr-2 text-blue-500" />
                  Assigned Tests
                </h4>
                <div className="space-y-3">
                  {patient.tests.map((test: any, index: number) => {
                    const category =
                      testCategories[
                        test.name as keyof typeof testCategories
                      ] || 'Other'
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <div className="font-medium text-sm text-black">
                            {test.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Category: {category}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Badge className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    View Full Report
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black">
          Patient Lab Tests
        </h1>
        <p className="text-gray-600">
          View and manage patient test assignments
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients or tests..."
            className="pl-10 pr-4 py-2 w-full rounded-full border bg-white text-gray-700 border-gray-400 focus:outline-none bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs
          value={activeFilter}
          onValueChange={setActiveFilter}
          className="w-full md:w-auto max-w-xs md:max-w-full hidden sm:flex"
        >
          <TabsList className="p-1 rounded-full bg-white border border-blue-100">
            <TabsTrigger
              value="all"
              className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
            >
              All Tests
            </TabsTrigger>
            <TabsTrigger
              value="bloodwork"
              className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
            >
              Bloodwork
            </TabsTrigger>
            <TabsTrigger
              value="radiology"
              className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
            >
              Radiology
            </TabsTrigger>
            <TabsTrigger
              value="cardiology"
              className="rounded-full px-4 py-1 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:hover:bg-blue-600 data-[state=active]:shadow-sm"
            >
              Cardiology
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Three column container with absolute positioning for cards */}
      <div className="relative">
        {/* First column */}
        <div className="absolute left-0 top-0 w-full lg:w-1/3 pr-0 lg:pr-4">
          {filteredPatients
            .filter((_, index) => index % 3 === 0)
            .map(renderPatientCard)}
        </div>

        {/* Second column */}
        <div className="absolute left-0 lg:left-1/3 top-0 w-full lg:w-1/3 pr-0 lg:pr-4 mt-0 lg:mt-0">
          {filteredPatients
            .filter((_, index) => index % 3 === 1)
            .map(renderPatientCard)}
        </div>

        {/* Third column */}
        <div className="absolute left-0 lg:left-2/3 top-0 w-full lg:w-1/3 mt-0 lg:mt-0">
          {filteredPatients
            .filter((_, index) => index % 3 === 2)
            .map(renderPatientCard)}
        </div>

        {/* This div is just to make sure the parent has enough height */}
        <div
          style={{
            height:
              Math.max(
                filteredPatients.filter((_, i) => i % 3 === 0).length * 250,
                filteredPatients.filter((_, i) => i % 3 === 1).length * 250,
                filteredPatients.filter((_, i) => i % 3 === 2).length * 250,
              ) + (expandedPatientId ? 300 : 0),
          }}
        />
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No patients found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery
              ? `No patients match your search for "${searchQuery}". Try a different search term.`
              : 'No patients found for the selected filter.'}
          </p>
        </div>
      )}
    </div>
  )
}
