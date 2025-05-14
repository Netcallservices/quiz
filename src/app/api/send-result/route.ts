// app/api/send-result/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic'; // This ensures the route is not statically optimized

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
      console.error("Email configuration is missing in environment variables");
      return NextResponse.json(
        { success: false, error: "Email configuration is missing" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body: RequestBody = await request.json();
    if (!body.candidateName || !body.candidateEmail || !body.results) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Create transporter with more detailed configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // lowercase 'gmail' is typically preferred
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Helps in some environments with certificate issues
      }
    });

    // Verify the connection configuration
    await transporter.verify();
    
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

    console.log("Email sent successfully:", info.messageId);
    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Email send error:', error);

    let errorMessage = "Failed to send results";
    let errorDetails = null;

    if (error instanceof Error) {
      errorMessage = error.message;

      // If it's a Nodemailer-style error with a response object
      const maybeResponse = (error as Error & { response?: { body?: unknown } }).response;
      if (maybeResponse && maybeResponse.body) {
        errorDetails = maybeResponse.body;
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}