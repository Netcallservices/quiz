"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download } from "lucide-react";
import type { QuizResultSummary } from "../lib/actions";
import toast from 'react-hot-toast';

export default function ResultsViewer() {
  const [results, setResults] = useState<QuizResultSummary[]>([]);
  const [showPassword, setShowPassword] = useState(true);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  
  // Password protection (consider moving to environment variables)
  const ADMIN_PASSWORD = "Netcall$123";
  
  useEffect(() => {
  if (authenticated) {
    const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
    setResults(storedResults.sort((a: QuizResultSummary, b: QuizResultSummary) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }
}, [authenticated]);
useEffect(() => {
  if (authenticated) {
    try {
      const storedResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      console.log('Loaded results:', storedResults); // Debug log
      
      const sortedResults = storedResults.sort((a: QuizResultSummary, b: QuizResultSummary) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setResults(sortedResults);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error("Failed to load results");
    }
  }
}, [authenticated]);
  
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setShowPassword(false);
    } else {
      alert("Incorrect password Bro");
    }
  };
  
  const clearAllResults = () => {
    if (confirm("Are you sure you want to clear all results? This cannot be undone, think twice.")) {
      localStorage.removeItem('quizResults');
      setResults([]);
    }
  };

//   try {
//   // localStorage access code
// } catch (error) {
//   console.error("Error loading results:", error);
//   toast.error("Failed to load results");
// }
  
  const exportResults = () => {
    try {
      const dataStr = JSON.stringify(results, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const fileName = `quiz-results-${new Date().toISOString().slice(0, 10)}.json`;
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export results");
    }
  };

  if (showPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Your assessment submitted successfully. Thank You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Wish you a great day."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                onClick={handleLogin}
              >
                This button is for ADMIN, You may leave now😊
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 text-center">
            Assessment Results Overview
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={exportResults}
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button 
              variant="destructive" 
              onClick={clearAllResults}
              className="flex-1 sm:flex-none"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
        
        {results.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No assessment results available now</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{result.name}</h2>
                      <p className="text-sm text-gray-600">{result.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Completed: {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="font-mono font-bold">
                          {result.totalScore}/{result.maxPossibleScore}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        result.percentage >= 80 ? 'bg-green-100 text-green-800' :
                        result.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.percentage}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}