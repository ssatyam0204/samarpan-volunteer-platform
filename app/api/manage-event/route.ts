import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 1. UPDATE EVENT STATUS TO COMPLETED
export async function PUT(req: Request) {
  try {
    const { eventId } = await req.json()

    if (!eventId) return NextResponse.json({ message: "Event ID is required" }, { status: 400 })

    const updatedEvent = await prisma.requirement.update({
      where: { id: eventId },
      data: { status: "COMPLETED" }
    })

    return NextResponse.json({ success: true, event: updatedEvent }, { status: 200 })
  } catch (error) {
    console.error("MARK_COMPLETED_ERROR:", error)
    return NextResponse.json({ message: "Failed to mark event as completed" }, { status: 500 })
  }
}

// 2. DELETE EVENT COMPLETELY
export async function DELETE(req: Request) {
  try {
    const { eventId } = await req.json()

    if (!eventId) return NextResponse.json({ message: "Event ID is required" }, { status: 400 })

    // Safety measure: Delete all applications linked to this event first
    await prisma.application.deleteMany({
      where: { requirementId: eventId }
    })

    // Now safely delete the event itself
    await prisma.requirement.delete({
      where: { id: eventId }
    })

    return NextResponse.json({ success: true, message: "Event deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("DELETE_EVENT_ERROR:", error)
    return NextResponse.json({ message: "Failed to delete event" }, { status: 500 })
  }
}