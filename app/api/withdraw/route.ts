import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 })
    }

    // Find all applications for this volunteer where payment is PENDING,
    // and officially update them to PAID!
    const updatedRecords = await prisma.application.updateMany({
      where: {
        volunteerId: userId,
        paymentStatus: "PENDING"
      },
      data: {
        paymentStatus: "PAID"
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${updatedRecords.count} payouts.` 
    }, { status: 200 })

  } catch (error) {
    console.error("WITHDRAWAL_ERROR:", error)
    return NextResponse.json({ message: "Failed to process withdrawal" }, { status: 500 })
  }
}