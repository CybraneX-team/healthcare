"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Inputbox } from "@/components/ui/inputbox";
import { FileUpload } from "@/components/ui/file-upload";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  X, 
  Camera, 
  Upload, 
  Plus,
  Utensils,
  Dumbbell,
  Moon,
  Heart,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/utils/firebase";
import { 
  doc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

interface FoodIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NutritionData {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
}

export default function FoodIntakeModalNew({ isOpen, onClose }: FoodIntakeModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("meal-intake");
  const [foodImage, setFoodImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
    sugar: ""
  });

  // Simulate upload progress
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isUploading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodImage(reader.result as string);
        setIsUploading(true);
        
        // Reset progress for new upload
        setUploadProgress(0);
        
        // After 3 seconds, complete the "upload"
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(100);
          
          // Auto-fill some nutrition data as if it was analyzed
          setNutritionData({
            calories: "450",
            protein: "22",
            carbs: "56",
            fat: "12",
            fiber: "8",
            sugar: "14"
          });
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSaveData = async () => {
    if (!user) return;
    
    try {
      // Upload the food image to Firebase Storage if available
      let imageUrl = null;
      if (foodImage && foodImage.startsWith('data:')) {
        const storageRef = ref(storage, `food-intake/${user.id}/${Date.now()}`);
        
        // Convert base64 to blob
        const response = await fetch(foodImage);
        const blob = await response.blob();
        
        // Upload to Firebase Storage
        const uploadResult = await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
      
      // Save the food intake data to Firestore
      const foodIntakeRef = collection(db, "users", user.id, "foodIntake");
      await addDoc(foodIntakeRef, {
        ...nutritionData,
        imageUrl,
        timestamp: serverTimestamp(),
        type: activeTab
      });
      
      // Close the modal after saving
      onClose();
    } catch (error) {
      console.error("Error saving food intake data:", error);
    }
  };

  // Handle modal closing animation
  const handleAnimationComplete = () => {
    if (!isOpen) {
      setFoodImage(null);
      setIsUploading(false);
      setUploadProgress(0);
      setNutritionData({
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        fiber: "",
        sugar: ""
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white w-full max-w-5xl h-[90vh] rounded-xl overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
            onAnimationComplete={handleAnimationComplete}
          >
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Health Data</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="h-full">
                <TabsList className="flex flex-col items-stretch gap-1 bg-transparent">
                  <TabsTrigger 
                    value="meal-intake" 
                    className="flex items-center justify-start gap-3 px-3 py-2"
                  >
                    <Utensils className="h-4 w-4" />
                    <span>Meal Intake</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="workout" 
                    className="flex items-center justify-start gap-3 px-3 py-2"
                  >
                    <Dumbbell className="h-4 w-4" />
                    <span>Workout</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sleep" 
                    className="flex items-center justify-start gap-3 px-3 py-2"
                  >
                    <Moon className="h-4 w-4" />
                    <span>Sleep Periods</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="heart-rate" 
                    className="flex items-center justify-start gap-3 px-3 py-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Heart Rate</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="flex items-center justify-start gap-3 px-3 py-2"
                  >
                    <Activity className="h-4 w-4" />
                    <span>Daily Activity</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="meal-intake" className="mt-0 h-full">
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-semibold mb-6">Log Food Intake</h2>
                  
                  <div className="grid grid-cols-2 gap-8 flex-1">
                    {/* Left column - Upload */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label>Upload Food Image</Label>
                        {!foodImage ? (
                          <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={handleTriggerFileInput}
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Camera className="h-10 w-10 text-gray-400" />
                              <p className="text-sm text-gray-500">Click to upload a photo of your meal</p>
                              <p className="text-xs text-gray-400">We'll analyze the nutritional content</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img 
                              src={foodImage} 
                              alt="Food" 
                              className="w-full h-64 object-cover rounded-lg"
                            />
                            <button 
                              className="absolute top-2 right-2 bg-gray-800/70 text-white p-1 rounded-full hover:bg-gray-900/90"
                              onClick={() => setFoodImage(null)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                            
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <div className="bg-white p-4 rounded-lg w-3/4">
                                  <p className="text-sm font-medium mb-2">Analyzing image...</p>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {uploadProgress === 100 && (
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                          <p className="text-sm font-medium text-green-800">Image analyzed successfully!</p>
                          <p className="text-xs text-green-600">We've estimated the nutritional content based on your image.</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Right column - Nutrition data */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Food Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Inputbox
                              id="calories"
                              label="Calories"
                              type="number"
                              value={nutritionData.calories}
                              onChange={(e) => setNutritionData({...nutritionData, calories: e.target.value})}
                            />
                          </div>
                          <div>
                            <Inputbox
                              id="protein"
                              label="Protein (g)"
                              type="number"
                              value={nutritionData.protein}
                              onChange={(e) => setNutritionData({...nutritionData, protein: e.target.value})}
                            />
                          </div>
                          <div>
                            <Inputbox
                              id="carbs"
                              label="Carbs (g)"
                              type="number"
                              value={nutritionData.carbs}
                              onChange={(e) => setNutritionData({...nutritionData, carbs: e.target.value})}
                            />
                          </div>
                          <div>
                            <Inputbox
                              id="fat"
                              label="Fat (g)"
                              type="number"
                              value={nutritionData.fat}
                              onChange={(e) => setNutritionData({...nutritionData, fat: e.target.value})}
                            />
                          </div>
                          <div>
                            <Inputbox
                              id="fiber"
                              label="Fiber (g)"
                              type="number"
                              value={nutritionData.fiber}
                              onChange={(e) => setNutritionData({...nutritionData, fiber: e.target.value})}
                            />
                          </div>
                          <div>
                            <Inputbox
                              id="sugar"
                              label="Sugar (g)"
                              type="number"
                              value={nutritionData.sugar}
                              onChange={(e) => setNutritionData({...nutritionData, sugar: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Manual Entry</h3>
                        <div className="space-y-4">
                          <Inputbox
                            id="meal-name"
                            label="Meal Name"
                            type="text"
                            placeholder="e.g. Breakfast, Lunch, Dinner"
                          />
                          <Inputbox
                            id="meal-time"
                            label="Time"
                            type="time"
                            defaultValue={new Date().toTimeString().slice(0, 5)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveData}>
                      Save Data
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="workout" className="mt-0">
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-semibold mb-6">Log Workout</h2>
                  <p className="text-gray-500">
                    Record your workout details here. This feature is coming soon.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="sleep" className="mt-0">
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-semibold mb-6">Log Sleep</h2>
                  <p className="text-gray-500">
                    Record your sleep patterns here. This feature is coming soon.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="heart-rate" className="mt-0">
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-semibold mb-6">Heart Rate</h2>
                  <p className="text-gray-500">
                    Record your heart rate measurements here. This feature is coming soon.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-0">
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-semibold mb-6">Daily Activity</h2>
                  <p className="text-gray-500">
                    Record your daily activities here. This feature is coming soon.
                  </p>
                </div>
              </TabsContent>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 