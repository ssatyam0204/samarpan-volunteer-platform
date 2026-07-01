import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { volunteerId } = await req.json()

    if (!volunteerId) return NextResponse.json({ message: "Volunteer ID is required" }, { status: 400 })

    // 1. Fetch the user's full details safely 
    const user = await prisma.user.findUnique({
      where: { id: volunteerId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        createdAt: true,
        phone: true,
        bio: true,
        upiId: true,
        walletBalance: true,
        rating: true,
        isVerified: true,
        dob: true,
        aadharNumber: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        bloodGroup: true,
        // 🚀 THE FIX: Tell the database to actually send the photo back!
        profileImage: true 
      }
    })

    if (!user) return NextResponse.json({ message: "Volunteer not found" }, { status: 404 })

    // 2. Fetch their COMPLETED applications safely
    const completedApps = await prisma.application.findMany({
      where: {
        volunteerId: volunteerId,
        status: "COMPLETED"
      },
      include: {
        requirement: {
          include: {
            creator: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 3. Combine them into the exact format your frontend is expecting
    const volunteerData = {
      ...user,
      applications: completedApps
    }

    return NextResponse.json({ success: true, volunteer: volunteerData }, { status: 200 })
  } catch (error) {
    console.error("FETCH_PROFILE_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch profile." }, { status: 500 })
  }
}