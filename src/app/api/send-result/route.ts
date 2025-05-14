// app/api/send-result/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ResultData {
  question: string;
  answer: string;
  value: number;
}

interface RequestBody {
  candidateName: string;
  candidateEmail: string;
  totalScore: number;
  percentage: number;
  results: ResultData[];
}

export async function POST(request: Request) {
  try {
    // Validate environment variables first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !process.env.ADMIN_EMAIL) {
      throw new Error("Email configuration is missing in environment variables");
    }

    // Parse and validate request body
    const body: RequestBody = await request.json();
    if (!body.candidateName || !body.candidateEmail || !body.results) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Create transporter inside try block
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Build email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Quiz Submission from ${body.candidateName}</h2>
        <p><strong>Candidate Email:</strong> ${body.candidateEmail}</p>
        <p><strong>Total Score:</strong> ${body.totalScore}</p>
        <p><strong>Percentage:</strong> ${body.percentage}%</p>
        <h3>Detailed Results:</h3>
        <ul>
          ${body.results.map(result => `
            <li style="margin-bottom: 15px;">
              <strong>${result.question}</strong><br>
              Answer: ${result.answer}<br>
              Score: ${result.value}
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: `Quiz System <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Quiz Result - ${body.candidateName}`,
      html: emailHtml,
    });

    console.log("Email sent:", info.messageId);
    return NextResponse.json({ success: true });

  }  catch (error: unknown) {
  let errorMessage = "Failed to send results";
  let errorDetails = null;

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  // Optional: If using Node.js/Nodemailer-specific errors
  if (typeof error === 'object' && error !== null && 'response' in error) {
    errorDetails = (error as any).response?.body;
  }

  console.error('Email send error:', error);

  return NextResponse.json(
    { success: false, error: errorMessage, details: errorDetails },
    { status: 500 }
  );
  }
}