import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs" // 🚀 Added bcrypt (change to "bcrypt" if that's what your register route uses)

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // 2. Verify the OTP matches
    if (user.resetOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP code" }, { status: 400 })
    }

    // 3. Verify the OTP hasn't expired
    if (!user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
      return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 })
    }

    // 🚀 4. THE FIX: Hash the password before saving!
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Update to the new hashed password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null
      }
    })

    return NextResponse.json({ success: true, message: "Password reset successfully!" }, { status: 200 })

  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error)
    return NextResponse.json({ message: "Failed to reset password" }, { status: 500 })
  }
}