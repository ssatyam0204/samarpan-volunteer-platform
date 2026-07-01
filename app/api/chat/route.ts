import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET ALL MESSAGES FOR A CHATROOM
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) return NextResponse.json({ message: "Missing Application ID" }, { status: 400 })

    const messages = await prisma.message.findMany({
      where: { applicationId: applicationId },
      orderBy: { createdAt: 'asc' } // Oldest at the top, newest at the bottom
    })

    return NextResponse.json({ success: true, messages }, { status: 200 })
  } catch (error) {
    console.error("FETCH_CHAT_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch chat" }, { status: 500 })
  }
}

// SEND A NEW MESSAGE
export async function POST(req: Request) {
  try {
    // 🚀 1. Extract the attachment from the incoming request
    const { applicationId, senderId, senderName, text, attachment } = await req.json()

    // 🚀 2. FIXED SECURITY CHECK: Ensure they send EITHER text OR an attachment (or both)
    if ((!text && !attachment) || !applicationId) {
        return NextResponse.json({ message: "Missing data" }, { status: 400 })
    }

    // 🚀 3. Save the attachment directly to the database
    const newMessage = await prisma.message.create({
      data: { 
        applicationId, 
        senderId, 
        senderName, 
        text, 
        attachment
      }
    })

    return NextResponse.json({ success: true, message: newMessage }, { status: 200 })
  } catch (error) {
    console.error("SEND_MESSAGE_ERROR:", error)
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}