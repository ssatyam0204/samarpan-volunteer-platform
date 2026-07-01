import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Fetch all events created by this specific NGO from the database
    const events = await prisma.requirement.findMany({
      where: {
        creatorId: userId
      },
      orderBy: {
        createdAt: 'desc' // Show the newest events at the top
      }
    })

    return NextResponse.json({ success: true, events }, { status: 200 })

  } catch (error) {
    console.error("FETCH_EVENTS_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch events" }, { status: 500 })
  }
}