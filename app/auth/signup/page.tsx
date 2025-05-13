"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Inputbox } from "@/components/ui/inputbox";
import { FileUpload } from "@/components/ui/file-upload";
import { LiquidSwitch } from "@/components/ui/liquid-switch";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { 
  Calendar as CalendarIcon, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Check,
  X
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

type Step = 
  | "email" 
  | "password" 
  | "2fa-setup" 
  | "name"
  | "dob"
  | "diagnosis"
  | "medications"
  | "contact"
  | "avatar"
  | "review";

interface UserProfile {
  email: string;
  password: string;
  use2FA: boolean;
  fullName: string;
  dateOfBirth: Date | undefined;
  primaryDiagnosis: string;
  medications: string;
  phone: string;
  avatar: string | null;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    password: "",
    use2FA: false,
    fullName: "",
    dateOfBirth: undefined,
    primaryDiagnosis: "",
    medications: "",
    phone: "",
    avatar: null,
  });
  
  // Calculate progress percentage based on current step
  const steps: Step[] = [
    "email", "password", "2fa-setup", "name", "dob", 
    "diagnosis", "medications", "contact", "avatar", "review"
  ];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = Math.round((currentStepIndex / (steps.length - 1)) * 100);
  
  const handleNext = () => {
    // Don't proceed if currently submitting
    if (isSubmitting) return;
    
    // Validate current step
    if (currentStep === "email") {
      if (!validateEmail(profile.email)) {
        setError("Please enter a valid email address");
        return;
      }
      setCurrentStep("password");
    } 
    else if (currentStep === "password") {
      if (profile.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      setCurrentStep("2fa-setup");
    }
    else if (currentStep === "2fa-setup") {
      setCurrentStep("name");
    }
    else if (currentStep === "name") {
      if (!profile.fullName.trim()) {
        setError("Please enter your full name");
        return;
      }
      setCurrentStep("dob");
    }
    else if (currentStep === "dob") {
      if (!profile.dateOfBirth) {
        setError("Please select your date of birth");
        return;
      }
      setCurrentStep("diagnosis");
    }
    else if (currentStep === "diagnosis") {
      if (!profile.primaryDiagnosis.trim()) {
        setError("Please enter your primary diagnosis");
        return;
      }
      setCurrentStep("medications");
    }
    else if (currentStep === "medications") {
      setCurrentStep("contact");
    }
    else if (currentStep === "contact") {
      if (!profile.phone.trim()) {
        setError("Please enter your phone number");
        return;
      }
      setCurrentStep("avatar");
    }
    else if (currentStep === "avatar") {
      setCurrentStep("review");
    }
    else if (currentStep === "review") {
      handleSignup();
    }
    
    setError(null);
  };
  
  const handleBack = () => {
    const prevStepIndex = Math.max(0, currentStepIndex - 1);
    setCurrentStep(steps[prevStepIndex]);
    setError(null);
  };
  
  const handleSignup = async () => {
    setIsSubmitting(true);
    
    try {
      // Show success animation before redirecting
      setShowSuccess(true);
      
      // Here you would submit the profile data to your backend
      await signup(profile);
      
      // Wait for the animation to complete before redirecting
      setTimeout(() => {
        // Redirect to file upload
        router.push("/auth/upload");
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      setShowSuccess(false);
      setError("An error occurred during signup. Please try again.");
    }
  };
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };
  
  // Use the keyboard navigation hook
  useKeyboardNavigation(
    handleNext,
    [currentStep, profile, isSubmitting],
    true // Exclude textareas (like in the medications step)
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Overlay success animation */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-green-100 rounded-full p-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Check className="w-16 h-16 text-green-600" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          {currentStep === "email" && "Create Account"}
          {currentStep === "password" && "Secure Your Account"}
          {currentStep === "2fa-setup" && "Additional Security"}
          {currentStep === "name" && "Tell Us About You"}
          {currentStep === "dob" && "Your Date of Birth"}
          {currentStep === "diagnosis" && "Medical Information"}
          {currentStep === "medications" && "Your Medications"}
          {currentStep === "contact" && "Contact Information"}
          {currentStep === "avatar" && "Profile Picture"}
          {currentStep === "review" && "Review Your Information"}
        </h1>
        <p className="text-sm text-gray-500">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
        <div className="h-1 w-full bg-gray-100 mt-4">
          <div 
            className="h-1 bg-blue-600 transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className={`relative overflow-hidden ${currentStep === "review" ? "min-h-[450px]" : "min-h-[300px]"}`}>
        <AnimatePresence initial={false} custom={1}>
          {currentStep === "email" && (
            <motion.div
              key="email"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Inputbox
                    id="email"
                    type="email"
                    label="Email address"
                    value={profile.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    We'll use this email to contact you and for account recovery
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "password" && (
            <motion.div
              key="password"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Inputbox
                    id="password"
                    type="password"
                    label="Enter a Strong Password"
                    value={profile.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, password: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    Use at least 8 characters with a mix of letters, numbers, and symbols
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "2fa-setup" && (
            <motion.div
              key="2fa"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-blue-100 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Enable Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-blue-700">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <LiquidSwitch
                    checked={profile.use2FA}
                    onCheckedChange={(checked) => setProfile({ ...profile, use2FA: checked })}
                  />
                </div>
                
                {profile.use2FA && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg"
                  >
                    <p>You'll set up 2FA after creating your account.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === "name" && (
            <motion.div
              key="name"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Inputbox
                    id="fullName"
                    type="text"
                    label="Your full name"
                    value={profile.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "dob" && (
            <motion.div
              key="dob"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full flex justify-between text-left font-normal"
                      >
                        {profile.dateOfBirth ? (
                          format(profile.dateOfBirth, "PPP")
                        ) : (
                          <span className="text-gray-400">Select your date of birth</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={profile.dateOfBirth}
                        onSelect={(date) => setProfile({ ...profile, dateOfBirth: date })}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-500">
                    Your date of birth helps us provide age-appropriate recommendations
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "diagnosis" && (
            <motion.div
              key="diagnosis"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Inputbox
                    id="diagnosis"
                    type="text"
                    label="Primary diagnosis"
                    value={profile.primaryDiagnosis}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, primaryDiagnosis: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    This helps us customize your dashboard experience<br/> (e.g. Type 2 Diabetes)
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "medications" && (
            <motion.div
              key="medications"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Inputbox
                    id="medications"
                    type="text"
                    label="Current medications"
                    value={profile.medications}
                    onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    This information is private and secure
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "contact" && (
            <motion.div
              key="contact"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Inputbox
                    id="phone"
                    type="number"
                    label="Phone number"
                    value={profile.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                  <p className="text-sm text-gray-500">
                    For appointment reminders and account recovery
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "avatar" && (
            <motion.div
              key="avatar"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  {profile.avatar ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <Avatar className="w-32 h-32">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <button 
                        onClick={() => setProfile({ ...profile, avatar: null })}
                        className="absolute top-0 right-0 bg-red-100 text-red-600 rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <FileUpload
                      onChange={handleFileChange}
                      label="Upload profile photo (optional)"
                      accept="image/*"
                    />
                  )}
                  
                  {profile.avatar && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setProfile({ ...profile, avatar: null })}
                      className="flex items-center gap-2"
                    >
                      Remove photo
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "review" && (
            <motion.div
              key="review"
              custom={1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="w-10 h-10">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} />
                    ) : null}
                    <AvatarFallback className="bg-blue-100 text-blue-600">{profile.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{profile.fullName}</h3>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
                    <p>{profile.dateOfBirth ? format(profile.dateOfBirth, "PPP") : "Not provided"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Primary Diagnosis</h3>
                    <p>{profile.primaryDiagnosis}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Medications</h3>
                    <p>{profile.medications || "None provided"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                    <p>{profile.phone}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Two-Factor Authentication</h3>
                    <p>{profile.use2FA ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}
      
      <div className="mt-8 -ml-5 flex justify-between">
        {currentStepIndex > 0 ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-1"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/auth')}
            className="flex items-center gap-1"
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Button>
        )}
        
        <Button 
          onClick={handleNext}
          className={`flex items-center gap-1 ${currentStep === "review" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
              />
              Processing...
            </span>
          ) : (
            <>
              {currentStep === "review" ? "Complete Signup" : "Next"} 
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
} 