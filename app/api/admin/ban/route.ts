import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId, action } = await req.json()

    if (!userId || !action) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Action should be either "BAN" or "UNBAN"
    const isBanned = action === "BAN"

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned: isBanned }
    })

    return NextResponse.json({ 
      success: true, 
      message: `User successfully ${isBanned ? 'banned' : 'unbanned'}.`,
      user: { id: updatedUser.id, isBanned: updatedUser.isBanned }
    }, { status: 200 })

  } catch (error) {
    console.error("ADMIN_BAN_ERROR:", error)
    return NextResponse.json({ message: "Failed to update user status" }, { status: 500 })
  }
}