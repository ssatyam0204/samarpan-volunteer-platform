import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { applicationId, rating } = await req.json()

    if (!applicationId || !rating) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Save the rating and move the money to "PENDING"
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { 
        rating: rating,
        paymentStatus: "PENDING" 
      }
    })

    return NextResponse.json({ success: true, application: updatedApplication }, { status: 200 })
  } catch (error) {
    console.error("RATING_ERROR:", error)
    return NextResponse.json({ message: "Failed to submit rating." }, { status: 500 })
  }
}