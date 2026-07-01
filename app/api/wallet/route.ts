import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ message: "User ID required" }, { status: 400 })
    }

    // Securely fetch COMPLETED events where money is owed or paid
    const applications = await prisma.application.findMany({
      where: {
        volunteerId: userId,
        status: "COMPLETED",
        paymentStatus: { in: ["PENDING", "PAID"] }
      },
      include: {
        requirement: {
          include: {
            creator: true // Fetches the NGO details!
          }
        }
      }
    })

    return NextResponse.json({ success: true, applications }, { status: 200 })
  } catch (error) {
    console.error("WALLET_API_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch wallet" }, { status: 500 })
  }
}