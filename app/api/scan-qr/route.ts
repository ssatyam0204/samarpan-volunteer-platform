import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { applicationId, ngoId } = await req.json()

    if (!applicationId || !ngoId) {
      return NextResponse.json(
        { message: "Application ID and NGO ID are required." },
        { status: 400 }
      )
    }

    // Find the application with its related event
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { requirement: true }
    })

    if (!application) {
      return NextResponse.json(
        { message: "Application not found in database." },
        { status: 404 }
      )
    }

    // SECURITY CHECK: Verify NGO owns this event
    if (application.requirement.creatorId !== ngoId) {
      return NextResponse.json(
        { message: "Unauthorized: You do not own this event." },
        { status: 403 }
      )
    }

    // Prevent double scanning
    if (application.status === "COMPLETED") {
      return NextResponse.json(
        { message: "Attendance already marked for this volunteer." },
        { status: 400 }
      )
    }

    // Mark application as COMPLETED
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "COMPLETED" }
    })

    return NextResponse.json(
      { success: true, message: "Attendance Marked Successfully!" },
      { status: 200 }
    )

  } catch (error) {
    console.error("QR_SCAN_ERROR:", error)
    return NextResponse.json(
      { message: "Failed to verify attendance." },
      { status: 500 }
    )
  }
}