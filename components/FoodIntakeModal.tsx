'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { ChevronLeft, UploadCloud, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Lottie from 'lottie-react'
import * as animationData from './Vector.json'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/utils/firebase'
import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  orderBy,
} from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { WeightTrackingComponent } from './WeightTracker'
import WaterIntakeModel from './WaterIntakeModel'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

interface FoodIntakeModalProps {
  isOpen: boolean
  onClose: () => void
}

interface NutritionTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
    color: string
  }>
  label?: string
}

const NutritionTooltip = ({
  active,
  payload,
  label,
}: NutritionTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
        <p className="text-sm font-medium text-gray-800 mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm font-medium"
              style={{ color: entry.color }}
            >
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey === 'calories' ? ' kcal' : 'g'
              }`}
            </p>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export default function FoodIntakeModal({
  isOpen,
  onClose,
}: FoodIntakeModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedTab, setSelectedTab] = useState('Meal Intake')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [savingMeal, setSavingMeal] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState('Breakfast')
  const [mealLogDate, setMealLogDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [manualEntries, setManualEntries] = useState({
    carbohydrates: 0,
    fats: 0,
    protein: 0,
    total: 0,
  })

  // Comparison data state
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [comparisonPeriod, setComparisonPeriod] = useState<
    'weekly' | 'monthly'
  >('weekly')
  const [loadingComparison, setLoadingComparison] = useState(false)

  // State for habits
  const [habits, setHabits] = useState({
    fasting: {
      enabled: true,
      skipBreakfast: false,
      skipLunch: true,
      skipDinner: true,
    },
    sleepSchedule: {
      enabled: false,
      wakeUpTime: '07:15',
      sleepTime: '21:45',
    },
    exercise: {
      enabled: true,
      daysPerWeek: 5,
    },
  })

  type FoodItem = {
    item: string
    quantity: string
    calories: number
    protein: number
    carbs: number
    fats: number
    _originalMacros?: {
      calories: number
      protein: number
      carbs: number
      fats: number
      quantity: number
      unit: string
    }
    _quantityNum?: number
    _unit?: string
    checked?: boolean
    isManual?: boolean
  }
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiDebug, setApiDebug] = useState<string>('')
  const [uploadedMealImage, setUploadedMealImage] = useState<File | null>(null)
  // Body transformation state
  const [transformationImage, setTransformationImage] = useState<File | null>(
    null
  )
  const [currentWeight, setCurrentWeight] = useState<string>('')
  const [targetWeight, setTargetWeight] = useState<string>('')
  const [transformationResult, setTransformationResult] = useState<any | null>(
    null
  )
  const [transformationLoading, setTransformationLoading] = useState(false)
  const [transformationError, setTransformationError] = useState<string | null>(
    null
  )

  // Log Weight state
  const [weightToLog, setWeightToLog] = useState<string>('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [loggingWeight, setLoggingWeight] = useState(false)
  const [weightError, setWeightError] = useState<string | null>(null)
  const [weightLogDate, setWeightLogDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Water intake state
  const [waterIntake, setWaterIntake] = useState(0)
  const [loadingWaterData, setLoadingWaterData] = useState(false)
  const [waterGoal] = useState(2000) // Daily goal in ml
  const [savingWaterIntake, setSavingWaterIntake] = useState(false)

  // Calculate water level percentage (capped at 100% for animation)
  const waterLevelPercentage = Math.min((waterIntake / waterGoal) * 100, 100)

  // Fetch comparison data
  const fetchComparisonData = async (period: 'weekly' | 'monthly') => {
    if (!user?.id) return []

    try {
      setLoadingComparison(true)
      const currentDate = new Date()
      const startDate = new Date()

      // Calculate date range based on period
      switch (period) {
        case 'weekly':
          startDate.setDate(currentDate.getDate() - 7)
          break
        case 'monthly':
          startDate.setDate(currentDate.getDate() - 30)
          break
      }

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = currentDate.toISOString().split('T')[0]

      // Query daily summaries from Firestore
      const summariesCollection = collection(
        db,
        'users',
        user.id,
        'dailySummaries'
      )
      const q = query(
        summariesCollection,
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'asc')
      )

      const querySnapshot = await getDocs(q)
      const rawData: any[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        rawData.push({
          date: data.date,
          calories: data.totalCalories || 0,
          protein: data.totalProtein || 0,
          carbs: data.totalCarbs || 0,
          fats: data.totalFats || 0,
        })
      })

      // Process data based on period - only real data, no dummy data
      return processComparisonData(rawData, period)
    } catch (error) {
      console.error('Error fetching comparison data:', error)
      return []
    } finally {
      setLoadingComparison(false)
    }
  }

  // Process comparison data based on selected period
  const processComparisonData = (data: any[], period: 'weekly' | 'monthly') => {
    // If no real data, return empty array (no dummy data)
    if (data.length === 0) {
      return []
    }

    // Rest of the existing logic for real data processing remains the same...
    switch (period) {
      case 'weekly':
        // Show daily data for the last 7 days
        return data.map((item) => {
          const date = new Date(item.date)
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

          return {
            name: dayName,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
            date: item.date,
          }
        })

      case 'monthly':
        // Group by weeks for the last month
        const weeklyData: { [key: string]: { data: any[]; dates: string[] } } =
          {}

        data.forEach((item) => {
          const date = new Date(item.date)
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          const weekKey = weekStart.toISOString().split('T')[0]

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { data: [], dates: [] }
          }
          weeklyData[weekKey].data.push(item)
          weeklyData[weekKey].dates.push(item.date)
        })

        return Object.entries(weeklyData).map(
          ([weekStart, weekData], index) => {
            const avgCalories =
              weekData.data.reduce((sum, d) => sum + d.calories, 0) /
              weekData.data.length
            const avgProtein =
              weekData.data.reduce((sum, d) => sum + d.protein, 0) /
              weekData.data.length
            const avgCarbs =
              weekData.data.reduce((sum, d) => sum + d.carbs, 0) /
              weekData.data.length
            const avgFats =
              weekData.data.reduce((sum, d) => sum + d.fats, 0) /
              weekData.data.length

            return {
              name: `Week ${index + 1}`,
              calories: Math.round(avgCalories),
              protein: Math.round(avgProtein),
              carbs: Math.round(avgCarbs),
              fats: Math.round(avgFats),
              date: weekStart,
            }
          }
        )

      default:
        return []
    }
  }

  // Load comparison data when tab is selected or period changes
  useEffect(() => {
    if (selectedTab === 'Comparison' && user?.id) {
      const loadData = async () => {
        const data = await fetchComparisonData(comparisonPeriod)
        setComparisonData(data)
      }
      loadData()
    }
  }, [selectedTab, comparisonPeriod, user?.id])

  // Load water intake data on component mount
  useEffect(() => {
    const loadWaterIntake = async () => {
      if (!user) return

      try {
        setLoadingWaterData(true)
        const today = new Date().toISOString().split('T')[0]

        // Get the water intake document for today using date as document ID
        const waterIntakeRef = doc(
          db,
          `users/${user.id}/dailyWaterIntake`,
          today
        )
        const waterIntakeDoc = await getDoc(waterIntakeRef)

        if (waterIntakeDoc.exists()) {
          const data = waterIntakeDoc.data()
          setWaterIntake(data.totalIntake || 0)
        } else {
          setWaterIntake(0)
        }
      } catch (error) {
        console.error('Error loading water intake:', error)
        setWaterIntake(0)
      } finally {
        setLoadingWaterData(false)
      }
    }

    loadWaterIntake()
  }, [user])

  const tabs = [
    'Overall Transformation',
    'Meal Intake',
    'Water Intake',
    'Body Transformation',
    'Log Weight',
    'Comparison', // New tab added
  ]

  function parseQuantity(qty: string): { num: number; unit: string } {
    // Match leading number (int or float)
    const match = qty.match(/^(\d+(?:\.\d+)?)/)
    if (match) {
      const num = Number.parseFloat(match[1])
      const unit = qty.slice(match[1].length).trim()
      return { num, unit }
    }
    return { num: 1, unit: qty }
  }

  function processApiItems(items: any[]): FoodItem[] {
    return items.map((item) => {
      const { num, unit } = parseQuantity(item.quantity)
      return {
        ...item,
        _originalMacros: {
          calories: item.calories / num,
          protein: item.protein / num,
          carbs: item.carbs / num,
          fats: item.fats / num,
          quantity: num,
          unit,
        },
        _quantityNum: num,
        _unit: unit,
        checked: true,
      }
    })
  }

  // Water intake functions
  const handleWaterIntake = async (amount: number) => {
    if (!user) return

    try {
      setSavingWaterIntake(true)
      const newTotal = waterIntake + amount
      setWaterIntake(newTotal)

      // Save water intake to Firestore using date as document ID
      const today = new Date().toISOString().split('T')[0]
      const timestamp = new Date().toISOString()

      const waterIntakeRef = doc(db, `users/${user.id}/dailyWaterIntake`, today)
      await setDoc(
        waterIntakeRef,
        {
          totalIntake: newTotal,
          date: today,
          lastUpdated: timestamp,
          intakeHistory: arrayUnion({
            amount: amount,
            timestamp: timestamp,
          }),
        },
        { merge: true }
      )

      // Update dailySummaries with new total
      const dailySummaryRef = doc(db, 'users', user.id, 'dailySummaries', today)
      const existingSummary = await getDoc(dailySummaryRef)
      const existingData = existingSummary.exists()
        ? existingSummary.data()
        : {}

      await setDoc(
        dailySummaryRef,
        {
          ...existingData,
          date: today,
          waterIntake: newTotal,
          lastUpdated: new Date(),
        },
        { merge: true }
      )

      toast({
        title: 'Water intake updated',
        description: `Added ${amount}ml to your daily intake`,
      })
    } catch (error) {
      console.error('Error updating water intake:', error)
      // Revert the UI state on error
      setWaterIntake(waterIntake)
      toast({
        title: 'Error',
        description: 'Failed to update water intake',
        variant: 'destructive',
      })
    } finally {
      setSavingWaterIntake(false)
    }
  }

  const resetWaterIntake = async () => {
    if (!user) return

    try {
      setSavingWaterIntake(true)
      const today = new Date().toISOString().split('T')[0]

      // Delete the water intake document for today
      const waterIntakeRef = doc(db, `users/${user.id}/dailyWaterIntake`, today)
      await setDoc(waterIntakeRef, {
        totalIntake: 0,
        date: today,
        lastUpdated: new Date().toISOString(),
        intakeHistory: [],
      })

      setWaterIntake(0)

      // Update dailySummaries to reset water intake
      const dailySummaryRef = doc(db, 'users', user.id, 'dailySummaries', today)
      const existingSummary = await getDoc(dailySummaryRef)
      const existingData = existingSummary.exists()
        ? existingSummary.data()
        : {}

      await setDoc(
        dailySummaryRef,
        {
          ...existingData,
          date: today,
          totalWaterIntake: 0,
          lastUpdated: new Date(),
        },
        { merge: true }
      )

      toast({
        title: 'Water intake reset',
        description: 'Daily water intake has been reset to 0ml',
      })
    } catch (error) {
      console.error('Error resetting water intake:', error)
      toast({
        title: 'Error',
        description: 'Failed to reset water intake',
        variant: 'destructive',
      })
    } finally {
      setSavingWaterIntake(false)
    }
  }

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Store the uploaded image for preview
    setUploadedMealImage(file)

    setLoading(true)
    setError(null)
    setApiDebug('')
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/calories-tracker', {
        method: 'POST',
        body: formData,
      })
      const text = await res.text()
      setApiDebug(text)
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        setError('Invalid JSON response from API')
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError(data.error || 'Failed to analyze image')
        setLoading(false)
        return
      }
      const arr = Array.isArray(data) ? data : data.items
      setFoodItems(processApiItems(arr || []))
    } catch (err) {
      setError('Failed to analyze image')
    } finally {
      setLoading(false)
    }
  }

  // Handle transformation image upload
  const handleTransformationImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTransformationImage(file)
    setTransformationResult(null)
    setTransformationError(null)
  }

  // Submit transformation request
  const handleTransformationSubmit = async () => {
    if (!transformationImage || !currentWeight || !targetWeight) {
      setTransformationError(
        'Please provide an image, current weight, and target weight'
      )
      return
    }

    setTransformationLoading(true)
    setTransformationError(null)
    setTransformationResult(null)

    try {
      const formData = new FormData()
      formData.append('image', transformationImage)
      formData.append('currentWeight', currentWeight)
      formData.append('targetWeight', targetWeight)

      const res = await fetch('/api/transformation', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        const errorMessage = data.error || `Analysis failed (${res.status})`
        setTransformationError(errorMessage)
        console.error('Transformation API error:', data)
        return
      }

      if (data.description || data.timeline || data.key_changes) {
        setTransformationResult(data)
      } else {
        setTransformationError(
          'No transformation analysis received. Please try again with a clearer image.'
        )
      }
    } catch (err) {
      console.error('Transformation request error:', err)
      setTransformationError(
        'Network error. Please check your connection and try again.'
      )
    } finally {
      setTransformationLoading(false)
    }
  }

  // Update manual entries
  // const updateManualEntry = (field: keyof typeof manualEntries, value: number) => {
  //   const newEntries = { ...manualEntries, [field]: value };
  //   newEntries.total = newEntries.carbohydrates + newEntries.fats + newEntries.protein;
  //   setManualEntries(newEntries);
  // };

  const toggleFasting = () => {
    setHabits((prev) => ({
      ...prev,
      fasting: {
        ...prev.fasting,
        enabled: !prev.fasting.enabled,
      },
    }))
  }

  const toggleFastingOption = (option: string) => {
    setHabits((prev) => ({
      ...prev,
      fasting: {
        ...prev.fasting,
        [option]: !prev.fasting[option as keyof typeof prev.fasting],
      },
    }))
  }

  const toggleSleepSchedule = () => {
    setHabits((prev) => ({
      ...prev,
      sleepSchedule: {
        ...prev.sleepSchedule,
        enabled: !prev.sleepSchedule.enabled,
      },
    }))
  }

  const updateSleepTime = (
    field: 'wakeUpTime' | 'sleepTime',
    value: string
  ) => {
    setHabits((prev) => ({
      ...prev,
      sleepSchedule: {
        ...prev.sleepSchedule,
        [field]: value,
      },
    }))
  }

  const toggleExercise = () => {
    setHabits((prev) => ({
      ...prev,
      exercise: {
        ...prev.exercise,
        enabled: !prev.exercise.enabled,
      },
    }))
  }

  // Only allow editing the numeric quantity
  const handleQuantityChange = (idx: number, newNum: string) => {
    setFoodItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item
        const num = Number.parseFloat(newNum)
        const safeNum = isNaN(num) || num <= 0 ? 1 : num
        const orig = item._originalMacros!
        return {
          ...item,
          _quantityNum: safeNum,
          calories: Math.round(orig.calories * safeNum),
          protein: Math.round(orig.protein * safeNum),
          carbs: Math.round(orig.carbs * safeNum),
          fats: Math.round(orig.fats * safeNum),
        }
      })
    )
  }

  // Remove a food item
  const handleRemoveItem = (idx: number) => {
    setFoodItems((prev) => prev.filter((_, i) => i !== idx))
  }

  // Add a manual item
  const handleAddManualItem = () => {
    setFoodItems((prev) => [
      ...prev,
      {
        item: '',
        quantity: '1 unit',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        _originalMacros: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          quantity: 1,
          unit: 'unit',
        },
        _quantityNum: 1,
        _unit: 'unit',
        checked: true,
        isManual: true,
      },
    ])
  } // Save/log meal intake to Firebase
  const handleSaveMeal = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save your meal intake.',
        variant: 'destructive',
      })
      return
    }

    // Filter only checked items
    const checkedItems = foodItems.filter((item) => item.checked)

    if (checkedItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one food item to save.',
        variant: 'destructive',
      })
      return
    }

    setSavingMeal(true)

    try {
      // Calculate total macros from checked items
      const totalMacros = checkedItems.reduce(
        (totals, item) => ({
          calories: totals.calories + (item.calories || 0),
          protein: totals.protein + (item.protein || 0),
          carbs: totals.carbs + (item.carbs || 0),
          fats: totals.fats + (item.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      )

      // Prepare meal data
      const mealData = {
        userId: user.id,
        timestamp: new Date(),
        date: mealLogDate, // Use selected date instead of today
        mealType: selectedMealType, // Use the selected meal type
        foodItems: checkedItems.map((item) => ({
          name: item.item,
          quantity: item.isManual
            ? `${item._quantityNum} ${item._unit}`
            : item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          isManual: item.isManual || false,
        })),
        totalMacros,
        habits: {
          fasting: habits.fasting,
          sleepSchedule: habits.sleepSchedule,
          exercise: habits.exercise,
        },
      }
      const mealsCollection = collection(db, 'mealIntakes')
      const docRef = await addDoc(mealsCollection, mealData)
      const dailySummaryRef = doc(
        db,
        'users',
        user.id,
        'dailySummaries',
        mealData.date
      )

      const { getDoc } = await import('firebase/firestore')
      const existingSummary = await getDoc(dailySummaryRef)
      const existingData = existingSummary.exists()
        ? existingSummary.data()
        : {}

      await setDoc(
        dailySummaryRef,
        {
          date: mealData.date,
          totalCalories:
            (existingData.totalCalories || 0) + totalMacros.calories,
          totalProtein: (existingData.totalProtein || 0) + totalMacros.protein,
          totalCarbs: (existingData.totalCarbs || 0) + totalMacros.carbs,
          totalFats: (existingData.totalFats || 0) + totalMacros.fats,
          mealCount: (existingData.mealCount || 0) + 1,
          lastUpdated: new Date(),
        },
        { merge: true }
      )
      toast({
        title: `${selectedMealType} Logged Successfully! 🍽️`,
        description: `Saved ${checkedItems.length} food items with ${totalMacros.calories} calories total for ${new Date(mealLogDate).toLocaleDateString()}.`,
      })
      // Reset form
      setFoodItems([])
      setUploadedMealImage(null)
      setMealLogDate(new Date().toISOString().split('T')[0]) // Reset to today
      onClose()
    } catch (error) {
      console.error('Error saving meal intake:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save meal intake. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSavingMeal(false)
    }
  }

  // Toggle checklist
  const handleToggleCheck = (idx: number) => {
    setFoodItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, checked: !item.checked } : item
      )
    )
  }

  // Handle weight logging
  const handleLogWeight = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to log your weight.',
        variant: 'destructive',
      })
      return
    }

    if (
      !weightToLog ||
      isNaN(Number(weightToLog)) ||
      Number(weightToLog) <= 0
    ) {
      setWeightError('Please enter a valid weight')
      return
    }

    setLoggingWeight(true)
    setWeightError(null)

    try {
      const today = weightLogDate // Use selected date instead of today
      const weightValue = Number(weightToLog)

      // Convert to kg if necessary (for consistency)
      const weightInKg =
        weightUnit === 'lbs' ? weightValue * 0.453592 : weightValue

      // Save to dailyWeight collection
      const weightData = {
        userId: user.id,
        date: today,
        weight: weightInKg,
        originalWeight: weightValue,
        unit: weightUnit,
        timestamp: new Date(),
      }

      const dailyWeightRef = doc(db, 'users', user.id, 'dailyWeight', today)
      await setDoc(dailyWeightRef, weightData, { merge: true })

      // Also update the dailySummaries for consistency
      const dailySummaryRef = doc(db, 'users', user.id, 'dailySummaries', today)
      const { getDoc } = await import('firebase/firestore')
      const existingSummary = await getDoc(dailySummaryRef)
      const existingData = existingSummary.exists()
        ? existingSummary.data()
        : {}

      await setDoc(
        dailySummaryRef,
        {
          ...existingData,
          date: today,
          weight: weightInKg,
          weightUnit: weightUnit,
          lastUpdated: new Date(),
        },
        { merge: true }
      )

      toast({
        title: 'Weight Logged Successfully! ⚖️',
        description: `Your weight of ${weightValue} ${weightUnit} has been saved for ${new Date(weightLogDate).toLocaleDateString()}.`,
      })

      // Reset form
      setWeightToLog('')
      setWeightError(null)
      setWeightLogDate(new Date().toISOString().split('T')[0]) // Reset to today
      onClose()
    } catch (error) {
      console.error('Error logging weight:', error)
      setWeightError('Failed to save weight. Please try again.')
      toast({
        title: 'Save Failed',
        description: 'Failed to save weight. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoggingWeight(false)
    }
  }

  // New comparison content renderer
  const renderComparisonContent = () => (
    <div className="flex-1 overflow-auto">
      <div className="mb-6 sm:mb-8 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-black">
              Nutrition Comparison
            </h2>
            <p className="text-gray-600">
              Compare your nutrition intake over time
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-full p-1">
            {(['weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setComparisonPeriod(period)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  comparisonPeriod === period
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadingComparison ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading comparison data...</span>
          </div>
        </div>
      ) : comparisonData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-gray-400 text-xl">📊</span>
          </div>
          <p className="text-sm text-center">No nutrition data available</p>
          <p className="text-xs text-center mt-1">
            Start logging meals to see comparisons
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calories Bar Chart */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900">
                    Calories Intake
                  </h3>
                  <p className="text-sm text-orange-600">
                    Daily calorie consumption
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔥</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#fed7aa"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9a3412' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9a3412' }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip content={<NutritionTooltip />} />
                    <Bar
                      dataKey="calories"
                      fill="#ea580c"
                      radius={[4, 4, 0, 0]}
                      name="calories"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Protein Line Chart */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Protein Intake
                  </h3>
                  <p className="text-sm text-red-600">
                    Daily protein consumption
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🥩</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={comparisonData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#fecaca"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#991b1b' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#991b1b' }}
                      tickFormatter={(value) => `${value}g`}
                    />
                    <Tooltip content={<NutritionTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="protein"
                      stroke="#dc2626"
                      strokeWidth={3}
                      dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#dc2626' }}
                      name="protein"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Carbs Bar Chart */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">
                    Carbs Intake
                  </h3>
                  <p className="text-sm text-yellow-600">
                    Daily carbohydrate consumption
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🍞</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#fef3c7"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#92400e' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#92400e' }}
                      tickFormatter={(value) => `${value}g`}
                    />
                    <Tooltip content={<NutritionTooltip />} />
                    <Bar
                      dataKey="carbs"
                      fill="#d97706"
                      radius={[4, 4, 0, 0]}
                      name="carbs"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Fats Line Chart */}
          <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">
                    Fats Intake
                  </h3>
                  <p className="text-sm text-purple-600">
                    Daily fat consumption
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🥑</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={comparisonData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e9d5ff"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#7c2d12' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#7c2d12' }}
                      tickFormatter={(value) => `${value}g`}
                    />
                    <Tooltip content={<NutritionTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="fats"
                      stroke="#9333ea"
                      strokeWidth={3}
                      dot={{ fill: '#9333ea', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#9333ea' }}
                      name="fats"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  const renderHabitsContent = () => (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
      {/* Left side - Add Habits */}
      <div className="flex-1 lg:max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-bold">Add Habits</h2>
        </div>

        <div className="space-y-6">
          {/* Fasting Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Fasting</h3>
              <button
                onClick={toggleFasting}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  habits.fasting.enabled
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {habits.fasting.enabled && (
                  <svg
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4.5L4.5 8L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-center gap-3 ${
                  habits.fasting.enabled
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    habits.fasting.enabled && habits.fasting.skipBreakfast
                      ? 'bg-blue-600 border-blue-600'
                      : habits.fasting.enabled
                      ? 'border-gray-300'
                      : 'border-gray-200'
                  }`}
                >
                  {habits.fasting.enabled && habits.fasting.skipBreakfast && (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4.5L4.5 8L11 1.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`${
                    habits.fasting.enabled ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  Skip Breakfast
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={habits.fasting.skipBreakfast}
                  disabled={!habits.fasting.enabled}
                  onChange={() =>
                    habits.fasting.enabled &&
                    toggleFastingOption('skipBreakfast')
                  }
                />
              </label>

              <label
                className={`flex items-center gap-3 ${
                  habits.fasting.enabled
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    habits.fasting.enabled && habits.fasting.skipLunch
                      ? 'bg-blue-600 border-blue-600'
                      : habits.fasting.enabled
                      ? 'border-gray-300'
                      : 'border-gray-200'
                  }`}
                >
                  {habits.fasting.enabled && habits.fasting.skipLunch && (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4.5L4.5 8L11 1.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`${
                    habits.fasting.enabled ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  Skip Lunch
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={habits.fasting.skipLunch}
                  disabled={!habits.fasting.enabled}
                  onChange={() =>
                    habits.fasting.enabled && toggleFastingOption('skipLunch')
                  }
                />
              </label>

              <label
                className={`flex items-center gap-3 ${
                  habits.fasting.enabled
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    habits.fasting.enabled && habits.fasting.skipDinner
                      ? 'bg-blue-600 border-blue-600'
                      : habits.fasting.enabled
                      ? 'border-gray-300'
                      : 'border-gray-200'
                  }`}
                >
                  {habits.fasting.enabled && habits.fasting.skipDinner && (
                    <svg
                      width="12"
                      height="9"
                      viewBox="0 0 12 9"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 4.5L4.5 8L11 1.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`${
                    habits.fasting.enabled ? 'text-gray-700' : 'text-gray-400'
                  }`}
                >
                  Skip Dinner
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={habits.fasting.skipDinner}
                  disabled={!habits.fasting.enabled}
                  onChange={() =>
                    habits.fasting.enabled && toggleFastingOption('skipDinner')
                  }
                />
              </label>
            </div>
          </div>

          {/* Sleep Schedule Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Sleep Schedule</h3>
              <button
                onClick={toggleSleepSchedule}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  habits.sleepSchedule.enabled
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {habits.sleepSchedule.enabled && (
                  <svg
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4.5L4.5 8L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Wake-up Time
                </label>
                <input
                  type="time"
                  value={habits.sleepSchedule.wakeUpTime}
                  onChange={(e) =>
                    updateSleepTime('wakeUpTime', e.target.value)
                  }
                  disabled={!habits.sleepSchedule.enabled}
                  className={`w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 ${
                    habits.sleepSchedule.enabled
                      ? 'text-black'
                      : 'text-gray-400'
                  }`}
                  style={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Sleep Time
                </label>
                <input
                  type="time"
                  value={habits.sleepSchedule.sleepTime}
                  onChange={(e) => updateSleepTime('sleepTime', e.target.value)}
                  disabled={!habits.sleepSchedule.enabled}
                  className={`w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 ${
                    habits.sleepSchedule.enabled
                      ? 'text-black'
                      : 'text-gray-400'
                  }`}
                  style={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </div>
          </div>

          {/* Exercise Section */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Exercise</h3>
              <button
                onClick={toggleExercise}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  habits.exercise.enabled
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {habits.exercise.enabled && (
                  <svg
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4.5L4.5 8L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {habits.exercise.daysPerWeek}
              </div>
              <div className="text-gray-600">Days a week</div>
            </div>
          </div>
        </div>
      </div>
      {/* Right side - Human Animation */}
      <div className="flex-1 flex items-center -mt-96  justify-center lg:min-h-[400px]">
        <div className="w-full max-w-sm lg:max-w-xs">
          <Lottie
            animationData={animationData}
            style={{ maxHeight: '300px', maxWidth: '100%' }}
            className="max-h-[300px] lg:max-h-[400px]"
            loop={true}
            autoplay={true}
          />
        </div>
      </div>{' '}
    </div>
  )

  const renderBodyTransformationContent = () => (
    <div className="flex-1">
      <div className="mb-6 sm:mb-8 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold">Body Transformation</h2>
        <p className="text-gray-600">
          Upload your image and set your weight goals
        </p>
      </div>
      {/* Weight inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm text-gray-600 mb-2">
            Current Weight (kg)
          </label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="Enter current weight"
            className="w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-black"
            style={{ fontSize: '24px', fontWeight: 'bold' }}
          />
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="block text-sm text-gray-600 mb-2">
            Target Weight (kg)
          </label>
          <input
            type="number"
            value={targetWeight}
            onChange={(e) => setTargetWeight(e.target.value)}
            placeholder="Enter target weight"
            className="w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 text-black"
            style={{ fontSize: '24px', fontWeight: 'bold' }}
          />
        </div>
      </div>
      {/* Upload area */}
      <div className="flex-1 border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-8 sm:p-16 lg:p-20 flex items-center justify-center relative overflow-hidden min-h-[300px] mb-6">
        {transformationImage ? (
          <div className="relative">
            <img
              src={
                URL.createObjectURL(transformationImage) || '/placeholder.svg'
              }
              alt="Selected image"
              className="max-w-full max-h-64 object-contain rounded-lg"
            />
            <button
              onClick={() => setTransformationImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center relative z-10">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleTransformationImageUpload}
            />
            <div className="mb-2 sm:mb-4 text-blue-500">
              <UploadCloud size={32} className="sm:w-16 sm:h-16" />
            </div>
            <span className="text-gray-500 text-sm sm:text-base text-center">
              Upload your current photo
            </span>
          </label>
        )}
      </div>
      {/* Submit button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleTransformationSubmit}
          disabled={
            transformationLoading ||
            !transformationImage ||
            !currentWeight ||
            !targetWeight
          }
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg shadow-sm transition"
        >
          {transformationLoading ? 'Analyzing...' : 'Analyze Transformation'}
        </button>
      </div>
      {/* Loading/Error */}
      {transformationLoading && (
        <div className="text-center text-blue-600 mb-4">
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Analyzing your transformation potential...
          </div>
        </div>
      )}
      {transformationError && (
        <div className="text-center text-red-600 mb-4">
          {transformationError}
        </div>
      )}{' '}
      {/* Transformation result */}
      {transformationResult && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#2563eb" opacity="0.1" />
              <path
                d="M8 12l2.5 2.5L16 9"
                stroke="#2563eb"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Your Transformation Analysis
          </h3>

          <div className="space-y-6">
            {/* Image display */}
            <div className="flex justify-center">
              <div className="text-center">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Current Photo ({currentWeight} kg → {targetWeight} kg)
                </h4>
                <img
                  src={
                    URL.createObjectURL(transformationImage!) ||
                    '/placeholder.svg' ||
                    '/placeholder.svg'
                  }
                  alt="Current"
                  className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200 mx-auto"
                />
              </div>
            </div>

            {/* Analysis content */}
            {transformationResult.description && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Transformation Overview
                </h4>
                <p className="text-gray-700">
                  {transformationResult.description}
                </p>
              </div>
            )}

            {transformationResult.timeline && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  Expected Timeline
                </h4>
                <p className="text-gray-700">{transformationResult.timeline}</p>
              </div>
            )}

            {transformationResult.key_changes &&
              transformationResult.key_changes.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Key Changes Expected
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {transformationResult.key_changes.map(
                      (change: string, index: number) => (
                        <li key={index}>{change}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {transformationResult.recommendations &&
              transformationResult.recommendations.length > 0 && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">
                    Recommendations
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {transformationResult.recommendations.map(
                      (rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {transformationResult.note && (
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  Important Note
                </h4>
                <p className="text-gray-700">{transformationResult.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
  const renderMealIntakeContent = () => (
    <div className="flex-1">
      {' '}
      <div className="mb-6 sm:mb-8 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="hidden sm:block text-xl sm:text-2xl font-bold">
              Upload Food Image
            </h2>
            <p className="hidden sm:block text-gray-600">
              Click to upload or Drag and drop
            </p>
          </div>
          {uploadedMealImage && (
            <div className="hidden sm:flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Image uploaded
            </div>
          )}
        </div>
        {/* Meal Type Selector */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Select Meal Type
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((mealType) => (
              <button
                key={mealType}
                onClick={() => setSelectedMealType(mealType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMealType === mealType
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {mealType}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Log Date
          </h3>
          <input
            type="date"
            value={mealLogDate}
            onChange={(e) => setMealLogDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      {/* Upload area - full height */}
      <div className="flex-1 border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-8 sm:p-16 lg:p-40 flex items-center justify-center relative overflow-hidden min-h-[300px]">
        {' '}
        {uploadedMealImage ? (
          /* Show uploaded image */
          <div className="relative max-w-full max-h-full flex flex-col items-center">
            <img
              src={URL.createObjectURL(uploadedMealImage) || '/placeholder.svg'}
              alt="Uploaded food image"
              className="max-w-full max-h-96 object-contain rounded-lg shadow-md mb-4"
            />
            <div className="flex gap-2">
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                Change Image
              </label>
              <button
                onClick={() => {
                  setUploadedMealImage(null)
                  setFoodItems([])
                  setError(null)
                  setApiDebug('')
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Remove Image
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {uploadedMealImage.name}
            </div>
          </div>
        ) : (
          <>
            {/* Background placeholder image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <Image
                src="/kcal_placeholder.png"
                alt="Food placeholder"
                width={1000}
                height={1000}
                className="object-contain max-w-full max-h-full"
              />
            </div>

            {/* Upload content */}
            <label className="cursor-pointer flex flex-col items-center relative z-10">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="mb-2 sm:mb-4 text-blue-500">
                <UploadCloud size={32} className="sm:w-16 sm:h-16" />
              </div>
              <span className="text-gray-500 text-sm sm:text-base text-center">
                Click to upload or drag and drop
              </span>
            </label>
          </>
        )}
      </div>{' '}
      {/* Loading/Error */}
      {loading && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <div className="text-blue-800 font-medium">
                Analyzing your food image...
              </div>
              <div className="text-blue-600 text-sm">
                This may take a few seconds
              </div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <div>
              <div className="text-red-800 font-medium">Analysis Failed</div>
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          </div>
        </div>
      )}
      {/* Food items table or no items message */}
      {foodItems.length > 0 ? (
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#2563eb" opacity="0.1" />
                <path
                  d="M8 12l2.5 2.5L16 9"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Detected Food Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full rounded-xl overflow-hidden border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-blue-50 text-blue-900">
                    <th className="px-4 py-2 font-semibold"></th>
                    <th className="px-4 py-2 font-semibold">Item</th>
                    <th className="px-4 py-2 font-semibold">Quantity</th>
                    <th className="px-4 py-2 font-semibold">Calories</th>
                    <th className="px-4 py-2 font-semibold">Protein (g)</th>
                    <th className="px-4 py-2 font-semibold">Carbs (g)</th>
                    <th className="px-4 py-2 font-semibold">Fats (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {foodItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`even:bg-gray-50 ${
                        !item.checked ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!item.checked}
                          onChange={() => handleToggleCheck(idx)}
                          className="accent-blue-600 w-5 h-5"
                        />
                      </td>
                      <td className="px-4 py-2 text-gray-800 font-medium">
                        {item.isManual ? (
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) =>
                              setFoodItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, item: e.target.value }
                                    : it
                                )
                              )
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                            placeholder="Name"
                          />
                        ) : (
                          item.item
                        )}
                      </td>
                      <td className="px-4 py-2 flex items-center gap-2">
                        {item.isManual ? (
                          <>
                            <input
                              type="number"
                              min={1}
                              value={item._quantityNum ?? 1}
                              onChange={(e) =>
                                handleQuantityChange(idx, e.target.value)
                              }
                              className="border border-gray-300 rounded-lg px-2 py-1 w-14 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                            />
                            <input
                              type="text"
                              value={item._unit}
                              onChange={(e) =>
                                setFoodItems((prev) =>
                                  prev.map((it, i) =>
                                    i === idx
                                      ? { ...it, _unit: e.target.value }
                                      : it
                                  )
                                )
                              }
                              className="border border-gray-300 rounded-lg px-2 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                              placeholder="unit"
                            />
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              min={1}
                              value={item._quantityNum ?? 1}
                              onChange={(e) =>
                                handleQuantityChange(idx, e.target.value)
                              }
                              className="border border-gray-300 rounded-lg px-3 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                            />
                            <span className="text-gray-500 text-xs ml-1">
                              × {item.isManual ? 'unit' : item._unit}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center text-blue-700 font-semibold">
                        {item.isManual ? (
                          <input
                            type="number"
                            value={item.calories}
                            min={0}
                            onChange={(e) =>
                              setFoodItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        calories: Number(e.target.value),
                                      }
                                    : it
                                )
                              )
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1 w-16 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                          />
                        ) : (
                          item.calories
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.isManual ? (
                          <input
                            type="number"
                            value={item.protein}
                            min={0}
                            onChange={(e) =>
                              setFoodItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, protein: Number(e.target.value) }
                                    : it
                                )
                              )
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1 w-14 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                          />
                        ) : (
                          item.protein
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.isManual ? (
                          <input
                            type="number"
                            value={item.carbs}
                            min={0}
                            onChange={(e) =>
                              setFoodItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, carbs: Number(e.target.value) }
                                    : it
                                )
                              )
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1 w-14 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                          />
                        ) : (
                          item.carbs
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {item.isManual ? (
                          <input
                            type="number"
                            value={item.fats}
                            min={0}
                            onChange={(e) =>
                              setFoodItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, fats: Number(e.target.value) }
                                    : it
                                )
                              )
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1 w-14 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-center"
                          />
                        ) : (
                          item.fats
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>{' '}
            </div>

            {/* Macro Summary */}
            {foodItems.some((item) => item.checked) && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Selected Items Summary
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      {foodItems
                        .filter((item) => item.checked)
                        .reduce((sum, item) => sum + (item.calories || 0), 0)}
                    </div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {foodItems
                        .filter((item) => item.checked)
                        .reduce((sum, item) => sum + (item.protein || 0), 0)}
                      g
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">
                      {foodItems
                        .filter((item) => item.checked)
                        .reduce((sum, item) => sum + (item.carbs || 0), 0)}
                      g
                    </div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      {foodItems
                        .filter((item) => item.checked)
                        .reduce((sum, item) => sum + (item.fats || 0), 0)}
                      g
                    </div>
                    <div className="text-xs text-gray-600">Fats</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-between items-center">
              <button
                onClick={handleAddManualItem}
                className="bg-gray-100 hover:bg-blue-50 text-blue-700 font-medium px-4 py-2 rounded-lg border border-gray-200 transition"
              >
                + Add Item Manually
              </button>{' '}
              <button
                onClick={handleSaveMeal}
                disabled={
                  savingMeal ||
                  foodItems.filter((item) => item.checked).length === 0
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition"
              >
                {savingMeal ? 'Saving...' : `Log ${selectedMealType}`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        !loading &&
        !error &&
        uploadedMealImage && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 text-xl">🔍</span>
              </div>
            </div>
            <h3 className="text-yellow-800 font-medium text-lg mb-2">
              No food items detected
            </h3>
            <p className="text-yellow-600 text-sm mb-4">
              The AI couldn't identify any food items in this image. Try
              uploading a clearer image with visible food items, or add items
              manually below.
            </p>
            <button
              onClick={handleAddManualItem}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              + Add Item Manually
            </button>
          </div>
        )
      )}
    </div>
  )

  const renderLogWeightContent = () => (
    <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl">⚖️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Log Your Weight
          </h2>
          <p className="text-gray-600">Track your daily weight progress</p>
        </div>

        {/* Weight Input Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-6">
            {/* Weight Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={weightToLog}
                    onChange={(e) => setWeightToLog(e.target.value)}
                    placeholder="Enter weight"
                    className="w-full text-3xl font-bold text-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Unit Selector */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setWeightUnit('kg')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      weightUnit === 'kg'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeightUnit('lbs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      weightUnit === 'lbs'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Date
              </label>
              <input
                type="date"
                value={weightLogDate}
                onChange={(e) => setWeightLogDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Error Message */}
            {weightError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-red-600 text-sm">{weightError}</span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleLogWeight}
              disabled={loggingWeight || !weightToLog}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-sm transition-all text-lg"
            >
              {loggingWeight ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                'Log Weight'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWaterIntakeContent = () => (
    <div className="flex flex-col lg:flex-row gap-8 w-full items-stretch">
      {/* Left: Water Intake Controls */}
      <div className="flex-1 flex flex-col gap-6 min-w-[260px]">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col items-center mb-2">
          <div className="text-gray-500 text-base mb-2">Water Intake</div>
          <div className="text-5xl font-extrabold text-blue-600 mb-1">
            {loadingWaterData ? '--' : waterIntake}
            <span className="text-2xl font-medium text-blue-400 ml-1">ml</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col gap-4">
          <div className="text-gray-500 text-base mb-2">Quick Add</div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleWaterIntake(250)}
              disabled={savingWaterIntake}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-lg shadow"
            >
              Add Intake
            </button>
            <div className="text-center text-gray-400 text-sm">250ml</div>
            <button
              onClick={() => handleWaterIntake(500)}
              disabled={savingWaterIntake}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-lg shadow"
            >
              Add Intake
            </button>
            <div className="text-center text-gray-400 text-sm">500ml</div>
            <button
              onClick={() => handleWaterIntake(1000)}
              disabled={savingWaterIntake}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-lg shadow"
            >
              Add Intake
            </button>
            <div className="text-center text-gray-400 text-sm">1000ml</div>
            <button
              onClick={resetWaterIntake}
              disabled={savingWaterIntake}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-xl transition-colors text-base mt-2"
            >
              {savingWaterIntake ? 'Resetting...' : 'Reset Daily Intake'}
            </button>
          </div>
        </div>
      </div>
      {/* Right: Today's Intake and Human Model */}
      <div className="flex-1 flex flex-col items-center justify-between gap-6 min-w-[260px]">
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 flex flex-col items-center w-full mb-4">
          <div className="text-gray-500 text-base mb-2">Today's Target</div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-extrabold text-blue-700">
              {waterIntake}{' '}
              <span className="text-lg font-medium text-blue-400">ml</span>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="absolute top-0 left-0" width="56" height="56">
                <circle
                  cx="28"
                  cy="28"
                  r="25"
                  stroke="#e0e7ef"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="25"
                  stroke="#3b82f6"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 25}
                  strokeDashoffset={
                    2 * Math.PI * 25 * (1 - waterLevelPercentage / 100)
                  }
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1s cubic-bezier(.4,2,.6,1)',
                  }}
                />
              </svg>
              <span className="absolute text-xs font-semibold text-blue-700">
                {Math.round(waterLevelPercentage)}%
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">Goal: {waterGoal} ml</div>
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          <WaterIntakeModel waterLevel={waterLevelPercentage} />
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full h-full sm:w-[95vw] sm:h-[95vh] max-w-7xl flex flex-col sm:flex-row overflow-hidden">
        {/* Mobile header with menu button */}
        <div className="sm:hidden flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onClose} className="flex items-center text-gray-600">
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>

          <h2 className="text-lg font-bold">{selectedTab}</h2>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Sidebar - hidden on mobile unless toggled */}
        <div
          className={`
          ${isSidebarOpen ? 'block' : 'hidden'} sm:block
          w-full sm:w-64 bg-gray-50 p-4 sm:rounded-l-3xl border-r border-gray-100
          absolute sm:relative z-10 sm:z-auto h-full sm:h-auto
        `}
        >
          {/* Desktop back button */}
          <button
            onClick={onClose}
            className="hidden sm:flex items-center text-gray-600 mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>

          {/* Navigation tabs */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab)
                  setIsSidebarOpen(false) // Close sidebar on mobile after selection
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors text-sm sm:text-base ${
                  selectedTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black/20 z-5"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col">
          {selectedTab === 'Habits' ? (
            renderHabitsContent()
          ) : selectedTab === 'Body Transformation' ? (
            renderBodyTransformationContent()
          ) : selectedTab === 'Water Intake' ? (
            renderWaterIntakeContent()
          ) : selectedTab === 'Overall Transformation' ? (
            <WeightTrackingComponent user={user!} />
          ) : selectedTab === 'Log Weight' ? (
            renderLogWeightContent()
          ) : selectedTab === 'Comparison' ? (
            renderComparisonContent()
          ) : (
            renderMealIntakeContent()
          )}
        </div>
      </div>
    </div>
  )
}
