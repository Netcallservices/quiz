"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { quizQuestions, quizTitle } from "../data/quiz-questions";
import { toast } from "sonner";

interface QuizUser {
  name: string;
  email: string;
}

export default function Quiz() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<QuizUser | null>(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = localStorage.getItem("quizUser");
        if (!userData) {
          router.push("/login");
          return;
        }
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error loading user data:", error);
        router.push("/login");
      }
    };
    
    loadUser();
  }, [router]);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const navigateQuestion = (direction: "next" | "prev") => {
    setCurrentQuestion(prev => {
      const newValue = direction === "next" ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(newValue, quizQuestions.length - 1));
    });
  };

  const validateSubmission = () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quizQuestions.length) {
      toast.error("Incomplete Submission", {
        description: `Answered ${answeredCount} of ${quizQuestions.length} questions`,
      });
      return false;
    }
    return true;
  };

  const processResults = () => {
    return quizQuestions.map((question, index) => {
      const answerId = answers[index];
      const answer = question.options.find(opt => opt.id === answerId);
      return {
        question: question.text,
        answer: answer?.text || "No answer provided",
        value: answer?.value || 0
      };
    });
  };

  const saveResults = (results: ReturnType<typeof processResults>) => {
    try {
      const resultData = {
        name: user!.name,
        email: user!.email,
        totalScore: results.reduce((sum, item) => sum + item.value, 0),
        maxPossibleScore: quizQuestions.length * 5,
        percentage: Math.round((results.reduce((sum, item) => sum + item.value, 0) / (quizQuestions.length * 5)) * 100),
        timestamp: new Date().toISOString(),
        details: results
      };

      const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const updatedResults = [resultData, ...existingResults];
      localStorage.setItem('quizResults', JSON.stringify(updatedResults));
      
      return true;
    } catch (error) {
      console.error("Local storage error:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateSubmission()) return;

    setIsSubmitting(true);
    
    try {
      const results = processResults();
      const saveSuccess = saveResults(results);
      
      if (!saveSuccess) throw new Error("Failed to save results");

      // Redirect to results viewer
      router.push("/results-viewer");
    } catch (error) {
      toast.error("Submission Failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQuestionData = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const isAnswered = answers[currentQuestion] !== undefined;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">Netcall Services</h1>
            <p className="text-sm text-gray-600">{quizTitle}</p>
          </div>
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-medium">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <form onSubmit={handleSubmit} className="max-w-3xl w-full">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQuestionData.text}
                  </h2>

                  <RadioGroup
                    value={answers[currentQuestion]}
                    onValueChange={handleAnswer}
                    className="space-y-4"
                  >
                    {currentQuestionData.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-2 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <RadioGroupItem 
                          value={option.id} 
                          id={option.id} 
                          className="peer"
                        />
                        <Label 
                          htmlFor={option.id} 
                          className="flex-grow cursor-pointer peer-data-[state=checked]:font-medium"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigateQuestion("prev")}
                      disabled={currentQuestion === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </Button>

                    {isLastQuestion ? (
                      <Button
                        type="submit"
                        disabled={!isAnswered || isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                      >
                        {isSubmitting ? (
                          <span className="animate-pulse">Submitting...</span>
                        ) : (
                          <>
                            Submit Quiz <Send className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => navigateQuestion("next")}
                        disabled={!isAnswered}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                      >
                        Next <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </form>
      </main>

      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-inner">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© {new Date().getFullYear()} Netcall Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}