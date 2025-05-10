"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  // Clear quiz session when returning to home
  useEffect(() => {
    localStorage.removeItem("currentQuizSession");
    localStorage.removeItem("quizProgress");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-indigo-700">Netcall Services</h1>
            <p className="text-sm text-gray-600">Sales Capacity Assessment</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link 
              href="/results-viewer"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
            >
              View Results
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl w-full"
        >
          <div className="p-8 sm:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Sales Capacity Assessment</h2>
              <p className="text-lg text-gray-600 mb-8">
                Complete this assessment to help us understand your sales capabilities and approach.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <h3 className="text-lg font-medium text-indigo-800 mb-2">How it works:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Sign in with your name and email</li>
                  <li>Answer all 15 questions at your own pace</li>
                  <li>Submit your answers to receive your results</li>
                </ul>
              </div>

              <div className="flex justify-center">
                <Link href="/login" passHref>
                  <Button 
                    size="lg" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-full transition-transform hover:scale-105"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-inner">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© {new Date().getFullYear()} Netcall Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}