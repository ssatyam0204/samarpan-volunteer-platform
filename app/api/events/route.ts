import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch all OPEN requirements and include the NGO's name
    const events = await prisma.requirement.findMany({
      where: { status: "OPEN" },
      include: {
        creator: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, events }, { status: 200 })
  } catch (error) {
    console.error("FETCH_ALL_EVENTS_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch events" }, { status: 500 })
  }
}