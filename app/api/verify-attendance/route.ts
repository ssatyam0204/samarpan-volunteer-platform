import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { applicationId, code } = await req.json()

    if (!applicationId || !code) {
        return NextResponse.json({ message: "Missing application ID or code" }, { status: 400 })
    }

    const application = await prisma.application.findUnique({
        where: { id: applicationId }
    })

    if (!application) return NextResponse.json({ message: "Application not found" }, { status: 404 })

    // 🚀 SECURITY CHECK: Does the typed code match the database code?
    if (application.qrCode?.toUpperCase() !== code.toUpperCase()) {
        return NextResponse.json({ message: "Invalid Attendance Code! Please check again." }, { status: 400 })
    }

    // 🎯 MATCH! Mark them as COMPLETED.
    const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status: "COMPLETED" }
    })

    return NextResponse.json({ success: true, application: updatedApplication }, { status: 200 })

  } catch (error) {
    console.error("VERIFY_ATTENDANCE_ERROR:", error)
    return NextResponse.json({ message: "Server error verifying attendance" }, { status: 500 })
  }
}