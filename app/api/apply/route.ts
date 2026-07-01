import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { eventId, volunteerId } = await req.json()

    if (!eventId || !volunteerId) {
      return NextResponse.json({ message: "Missing required data" }, { status: 400 })
    }

    // Check if the volunteer has already applied to this specific event
    const existingApplication = await prisma.application.findFirst({
      where: {
        requirementId: eventId,
        volunteerId: volunteerId
      }
    })

    if (existingApplication) {
      return NextResponse.json({ message: "You have already applied for this event!" }, { status: 400 })
    }

    // Create the new application ticket
    const application = await prisma.application.create({
      data: {
        requirementId: eventId,
        volunteerId: volunteerId,
        status: "PENDING"
      }
    })

    return NextResponse.json({ success: true, application }, { status: 201 })
  } catch (error) {
    console.error("APPLY_ERROR:", error)
    return NextResponse.json({ message: "Failed to submit application. Ensure database is updated." }, { status: 500 })
  }
}