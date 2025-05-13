"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { quizQuestions, quizTitle } from "../data/quiz-questions";
import { toast } from "sonner";

type QuizResult = {
  question: string;
  answer: string;
  value: number;
};

type QuizResultSummary = {
  name: string;
  email: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  timestamp: string;
  details: QuizResult[];
};

export default function Quiz() {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // State hooks
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds

  // User effect
  useEffect(() => {
    const userData = localStorage.getItem("quizUser");
    if (!userData) {
      router.push("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  // Timer management
  useEffect(() => {
    if (!user) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    intervalRef.current = timer;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user]);

  // Time warnings
  useEffect(() => {
    if (timeLeft === 600) { // 10 minutes remaining (900 - 600 = 300s = 5mins elapsed)
      toast.warning("10 minutes remaining!", { duration: 5000 });
    }
  }, [timeLeft]);

  // Stable callback for submission
  const handleSubmit = useCallback(async () => {
    if (!user) return;

    if (Object.keys(answers).length < quizQuestions.length) {
      toast.error("Please answer all questions", {
        description: `You've answered ${Object.keys(answers).length} out of ${quizQuestions.length} questions.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const results = quizQuestions.map((question, index) => {
        const selectedAnswer = answers[index];
        const answerObject = question.options.find(opt => opt.id === selectedAnswer);
        return {
          question: question.text,
          answer: answerObject?.text || "No answer",
          value: answerObject?.value || 0
        };
      });

      const totalScore = results.reduce((sum, result) => sum + result.value, 0);
      const maxPossibleScore = quizQuestions.length * 5;
      const percentage = Math.round((totalScore / maxPossibleScore) * 100);

      const response = await fetch('/api/send-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: user.name,
          candidateEmail: user.email,
          totalScore,
          percentage,
          results
        })
      });

      if (!response.ok) throw new Error('Failed to send results');

      toast.success("Results submitted successfully!");
      router.push("/success");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, answers, router]);

  // Auto-submit handler
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitted || !user) return;
    setIsSubmitted(true);
    await handleSubmit();
  }, [isSubmitted, user, handleSubmit]);

  // Answer handling
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  // Question navigation
  const navigateQuestion = (direction: "next" | "prev") => {
    setCurrentQuestion(prev => {
      const newValue = direction === "next" ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(newValue, quizQuestions.length - 1));
    });
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Conditional return AFTER all hooks
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQuestionData = quizQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-saffron-300 flex flex-col">
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">Netcall Services</h1>
            <p className="text-sm text-gray-600">{quizTitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-red-600">
              Time Remaining: {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-3xl w-full">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {progress.toFixed(0)}% Complete
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
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-grow cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => navigateQuestion("prev")}
                      disabled={currentQuestion === 0}
                      className="flex items-center"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>

                    {isLastQuestion ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={!isAnswered || isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSubmitting ? (
                          "Submitting..."
                        ) : (
                          <>
                            Submit Quiz <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigateQuestion("next")}
                        disabled={!isAnswered}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 bg-white shadow-inner">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>© {new Date().getFullYear()} Netcall Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}