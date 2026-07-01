import { NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 })
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: "No user found with this email" }, { status: 401 })
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 })
    }

    // This is the important part for role-based redirection
    return NextResponse.json({ 
      success: true,
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role, // <-- ADD THIS COMMA
        isVerified: user.isVerified 
      } 
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Login server error" }, { status: 500 })
  }
}