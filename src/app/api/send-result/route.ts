// app/api/send-result/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const { candidateName, candidateEmail, totalScore, percentage, results } = await request.json();

  // Configure email transporter (using Gmail example)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your sending email
      pass: process.env.EMAIL_PASSWORD, // App password
    },
  });

  // HTML Email Template
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #2563eb;">New Quiz Submission</h2>
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #e2e8f0;">
        <p><strong>Candidate Name:</strong> ${candidateName}</p>
        <p><strong>Candidate Email:</strong> ${candidateEmail}</p>
        <p><strong>Total Score:</strong> ${totalScore}</p>
        <p><strong>Percentage:</strong> ${percentage}%</p>
      </div>

      <h3 style="color: #334155;">Detailed Results:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead style="background-color: #f1f5f9;">
          <tr>
            <th style="padding: 12px; border: 1px solid #cbd5e1;">Question</th>
            <th style="padding: 12px; border: 1px solid #cbd5e1;">Answer</th>
            <th style="padding: 12px; border: 1px solid #cbd5e1;">Score</th>
          </tr>
        </thead>
        <tbody>
          ${results.map((result: any) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #cbd5e1;">${result.question}</td>
              <td style="padding: 12px; border: 1px solid #cbd5e1;">${result.answer}</td>
              <td style="padding: 12px; border: 1px solid #cbd5e1; text-align: center;">${result.value}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `Quiz System <${process.env.EMAIL_USER}>`, // Sender address
      to: process.env.ADMIN_EMAIL, // Your admin email
      subject: `New Quiz Result - ${candidateName}`,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}