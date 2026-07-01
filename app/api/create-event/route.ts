import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, location, mapsLink, date, time, amount, creatorId, volunteersNeeded, paymentMode } = body

    // Updated validation to include our new fields
    if (!title || !description || !location || !date || !time || !creatorId || !volunteersNeeded || !paymentMode) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const eventDate = new Date(date)

    const newEvent = await prisma.requirement.create({
      data: {
        title,
        description,
        location,
        mapsLink: mapsLink || null,
        date: eventDate,
        time,
        amount: Number(amount) || 0.0,
        volunteersNeeded: Number(volunteersNeeded) || 1, // Store the number of volunteers
        paymentMode: paymentMode, // Store UPI, CASH, or WALLET
        creatorId,
        status: "OPEN" 
      }
    })

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })

  } catch (error) {
    console.error("CREATE_EVENT_ERROR:", error)
    return NextResponse.json({ message: "Failed to create event" }, { status: 500 })
  }
}