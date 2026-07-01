import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { complaintId, reply } = await req.json()

    if (!complaintId) {
      return NextResponse.json({ message: "Complaint ID is required" }, { status: 400 })
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { 
        status: "RESOLVED",
        adminReply: reply || "Issue resolved by Admin." // Saves the reply, or a default message
      }
    })

    return NextResponse.json({ success: true, complaint: updatedComplaint }, { status: 200 })

  } catch (error) {
    console.error("RESOLVE_COMPLAINT_ERROR:", error)
    return NextResponse.json({ message: "Failed to resolve complaint" }, { status: 500 })
  }
}