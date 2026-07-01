import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = registerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ message: "Invalid data", errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    const { name, email, password, role } = result.data
    await prisma.$connect()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await hash(password, 12)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "NGO" ? "NGO" : "VOLUNTEER",
      },
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Database connection failed" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}