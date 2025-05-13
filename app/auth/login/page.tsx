"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Inputbox } from "@/components/ui/inputbox";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

type Step = "email" | "password" | "2fa" | "error";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const handleNext = () => {
    if (currentStep === "email") {
      if (!email.trim()) {
        setError("Please enter your email address");
        return;
      }
      setCurrentStep("password");
      setError(null);
    } else if (currentStep === "password") {
      if (!password.trim()) {
        setError("Please enter your password");
        return;
      }
      
      // Simulate checking if 2FA is enabled
      const has2FA = false; // This would be determined by your API
      
      if (has2FA) {
        setCurrentStep("2fa");
      } else {
        // Here you would normally call an API to login
        handleLogin();
      }
      setError(null);
    } else if (currentStep === "2fa") {
      if (!twoFactorCode.trim() || twoFactorCode.length !== 6) {
        setError("Please enter a valid 6-digit code");
        return;
      }
      
      handleLogin();
      setError(null);
    }
  };
  
  // Use the keyboard navigation hook
  useKeyboardNavigation(
    handleNext, 
    [currentStep, email, password, twoFactorCode]
  );
  
  const handleLogin = async () => {
    // Simulate API call
    try {
      await login(email, password);
      
      // Redirect to the component dashboard page
      router.push("/component-dashboard");
    } catch (err) {
      setCurrentStep("error");
      setError("Invalid credentials. Please try again.");
    }
  };
  
  const handleBack = () => {
    if (currentStep === "password") {
      setCurrentStep("email");
    } else if (currentStep === "2fa") {
      setCurrentStep("password");
    } else if (currentStep === "error") {
      setCurrentStep("email");
    }
    setError(null);
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
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className=" rounded-2xl p-8"
    >
      <div className="mb-6">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-gray-800 mb-2"
        >
          Welcome Back
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          Log in to access your dashboard
        </motion.p>
      </div>
      
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        <AnimatePresence initial={false} custom={currentStep === "email" ? 1 : -1}>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Inputbox
                    id="email"
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "password" && (
            <motion.div
              key="password"
              custom={-1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Inputbox
                    id="password"
                    type="password"
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "2fa" && (
            <motion.div
              key="2fa"
              custom={-1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Inputbox
                    id="2fa"
                    type="text"
                    label="Two-factor authentication code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full"
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "error" && (
            <motion.div
              key="error"
              custom={-1}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full"
            >
              <div className="space-y-4">
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                  <p>{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && currentStep !== "error" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}
      
      <div className="mt-8 flex -ml-5 justify-between">
        {currentStep !== "email" ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/auth')}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Home
          </Button>
        )}
        
        <Button 
          onClick={handleNext}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
        >
          {currentStep === "2fa" ? "Login" : "Next"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
} 