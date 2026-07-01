import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // 1. Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "No account found with this email" }, { status: 404 })
    }

    // 2. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 3. Set OTP to expire in 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // 4. Save the OTP securely in the database
    await prisma.user.update({
      where: { email },
      data: { 
        resetOtp: otp, 
        resetOtpExpiry: otpExpiry 
      }
    })

    // 5. Connect to Gmail using your App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // 6. Design the Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Samarpan - Password Reset OTP",
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #111827; text-align: center;">Samarpan Security</h2>
          <p style="color: #4b5563; font-size: 16px;">You requested a password reset. Please use the verification code below to securely change your password.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #16a34a;">${otp}</span>
          </div>
          
          <p style="color: #ef4444; font-size: 14px; text-align: center;"><strong>Note:</strong> This OTP will expire in 10 minutes.</p>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    }

    // 7. Send it!
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: "OTP sent successfully!" }, { status: 200 })

  } catch (error) {
    console.error("OTP_EMAIL_ERROR:", error)
    return NextResponse.json({ message: "Failed to send OTP email" }, { status: 500 })
  }
}