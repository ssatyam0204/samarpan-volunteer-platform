import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) return NextResponse.json({ message: "Missing user ID" }, { status: 400 })

    // Fetch applications specifically for this volunteer
    const applications = await prisma.application.findMany({
      where: { volunteerId: userId },
      include: {
        requirement: {
          include: {
            creator: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' } // Show newest first
    })

    return NextResponse.json({ success: true, applications }, { status: 200 })
  } catch (error) {
    console.error("FETCH_MY_APPLICATIONS_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch applications" }, { status: 500 })
  }
}