"use server";

type QuizResult = {
  question: string;
  answer: string;
  value: number;
};

type SubmitQuizResultsParams = {
  name: string;
  email: string;
  results: QuizResult[];
};

export type QuizResultSummary = {
  name: string;
  email: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  timestamp: string;
  details: QuizResult[];
};

export async function submitQuizResults({ 
  name, 
  email, 
  results 
}: SubmitQuizResultsParams): Promise<{ 
  success: boolean; 
  data?: QuizResultSummary;
  error?: string 
}> {
  try {
    // Input validation
    if (!name || !email) {
      throw new Error("Name and email are required");
    }
    
    if (!results || results.length === 0) {
      throw new Error("No quiz results provided");
    }

    // Calculate scores
    const totalScore = results.reduce((sum, result) => sum + result.value, 0);
    const maxPossibleScore = 5 * results.length;
    
    if (maxPossibleScore === 0) {
      throw new Error("Invalid quiz configuration: No maximum score possible");
    }

    const percentage = Math.round((totalScore / maxPossibleScore) * 100);

    // Validate result values
    if (totalScore < 0 || totalScore > maxPossibleScore) {
      throw new Error("Invalid score calculation");
    }

    // Create result object
    const resultEntry: QuizResultSummary = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      totalScore,
      maxPossibleScore,
      percentage,
      timestamp: new Date().toISOString(),
      details: results.map(result => ({
        question: result.question.trim(),
        answer: result.answer.trim(),
        value: result.value
      }))
    };

    return { 
      success: true, 
      data: resultEntry 
    };

  } catch (error) {
    console.error("Error in submitQuizResults:", error);
    
    return { 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}