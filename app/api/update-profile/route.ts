import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // 🚀 THE FIX: We added profileImage to the list of accepted fields!
    const { 
      id, userId, 
      name, phone, bio, upiId, 
      dob, aadharNumber, address, city, state, pincode, bloodGroup,
      profileImage // <-- Added here
    } = body

    const targetId = id || userId

    if (!targetId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

    // Update the user in the database with EVERYTHING, including the new photo
    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: {
        name,
        phone,
        bio,
        upiId,
        dob,
        aadharNumber,
        address,
        city,
        state,
        pincode,
        bloodGroup,
        profileImage, // 🚀 Saves the Base64 image string directly to the database!
        isVerified: true // ✅ Auto-verify them since they filled out the KYC
      }
    })

    // 🚀 Security Check: Remove the password before sending the user back to the browser
    const { password, ...safeUser } = updatedUser

    return NextResponse.json({ success: true, user: safeUser }, { status: 200 })

  } catch (error: any) {
    console.error("UPDATE_PROFILE_ERROR:", error)
    
    // 🛡️ Prisma Error Code for "Duplicate Aadhar"
    if (error.code === 'P2002') {
        return NextResponse.json({ 
            message: "This Aadhar number or ID is already registered to another account." 
        }, { status: 400 })
    }
    
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
  }
}