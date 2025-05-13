"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function Success() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if directly accessed
    if (!localStorage.getItem("quizResults")) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Assessment Submitted Successfully!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for completing the assessment. Your results have been recorded.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/login")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
}