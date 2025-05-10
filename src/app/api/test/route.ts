import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const transporter = nodemailer.createTransport({
    host: process.env.CPANEL_SMTP_SERVER,
    port: Number(process.env.CPANEL_SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.CPANEL_EMAIL,
      pass: process.env.CPANEL_EMAIL_PASSWORD
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.CPANEL_EMAIL,
      to: 'uglygodthe@gmail.com',
      subject: 'cPanel Test Email',
      text: 'This is a test from your cPanel email'
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}