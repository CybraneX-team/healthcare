"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-8 text-center"
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-32 h-32 mx-auto mb-4"
        >
          <Image 
            src="/healthcare-logo.svg" 
            alt="Healthcare Logo" 
            width={128} 
            height={128}
            className="w-full h-full"
          />
        </motion.div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Healthcare Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Your personal health information center
        </p>
      </div>

      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Image 
            src="/healthcare-illustration.svg" 
            alt="Healthcare Illustration" 
            width={250} 
            height={200}
            priority
            className="mx-auto"
          />
        </motion.div>
      </div>

      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Button 
            variant="default" 
            size="lg" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/auth/login')}
          >
            Login
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={() => router.push('/auth/signup')}
          >
            Sign Up
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}