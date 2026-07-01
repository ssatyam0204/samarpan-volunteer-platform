import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId, title, description } = await req.json()

    if (!userId || !title || !description) {
      return NextResponse.json({ message: "Please fill out all fields." }, { status: 400 })
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: userId,
        title: title,
        description: description,
        status: "OPEN"
      }
    })

    return NextResponse.json({ success: true, complaint }, { status: 200 })
  } catch (error) {
    console.error("COMPLAINT_ERROR:", error)
    return NextResponse.json({ message: "Failed to submit complaint" }, { status: 500 })
  }
}