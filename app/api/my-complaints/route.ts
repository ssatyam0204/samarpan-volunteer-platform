import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) return NextResponse.json({ message: "User ID required" }, { status: 400 })

    const myComplaints = await prisma.complaint.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, complaints: myComplaints }, { status: 200 })
  } catch (error) {
    console.error("MY_COMPLAINTS_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch complaints" }, { status: 500 })
  }
}