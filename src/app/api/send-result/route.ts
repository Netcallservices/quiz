// app/api/send-result/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface SendResultRequestBody {
  candidateName: string;
  candidateEmail: string;
  totalScore: number;
  percentage: number;
  results: Array<{
    question: string;
    answer: string;
    value: number;
  }>;
}


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
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    const { candidateName, candidateEmail, totalScore, percentage, results } = 
      await request.json() as RequestBody;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>New Quiz Submission from ${candidateName}</h2>
        <p>Email: ${candidateEmail}</p>
        <p>Score: ${totalScore} (${percentage}%)</p>
        <h3>Detailed Results:</h3>
        <ul>
          ${results.map(result => `
            <li>
              <strong>${result.question}</strong><br>
              Answer: ${result.answer}<br>
              Score: ${result.value}
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    await transporter.sendMail({
      from: `Quiz System <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Quiz Result - ${candidateName}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send results' },
      { status: 500 }
    );
  }
}