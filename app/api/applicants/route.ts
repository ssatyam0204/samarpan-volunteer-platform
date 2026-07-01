import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 1. FETCH ALL APPLICANTS FOR THIS NGO (Untouched - perfectly fetches KYC fields)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    // 🚀 FIXED: Accepts both userId and ngoId just to be 100% safe with your frontend
    const targetId = body.userId || body.ngoId 

    if (!targetId) return NextResponse.json({ message: "Missing user ID" }, { status: 400 })

    // Find all applications where the event was created by this NGO
    const applications = await prisma.application.findMany({
      where: {
        requirement: { creatorId: targetId }
      },
      include: {
        requirement: { select: { title: true, amount: true, date: true, status: true } },
        
        // 🚀 THE FIX: We are now grabbing all the new KYC fields for your modal!
        volunteer: { 
          select: { 
            id: true,
            name: true, 
            email: true,
            phone: true,
            bio: true,
            bloodGroup: true,
            city: true,
            state: true,
            aadharNumber: true,
            isVerified: true
          } 
        }
      },
      orderBy: { createdAt: 'desc' } // Newest applications first
    })

    // 🚀 FIXED: Returns both 'applications' and 'applicants' keys so it matches whatever your UI asks for!
    return NextResponse.json({ success: true, applications, applicants: applications }, { status: 200 })
  } catch (error) {
    console.error("FETCH_APPLICANTS_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch applicants" }, { status: 500 })
  }
}

// 2. APPROVE OR REJECT AN APPLICANT & GENERATE 6-DIGIT CODE
export async function PUT(req: Request) {
  try {
    const { applicationId, status } = await req.json() // status will be 'APPROVED' or 'REJECTED'

    // 🚀 THE MAGIC: Generate a random 6-character code if they are approved!
    let generatedCode = undefined;
    if (status === 'APPROVED') {
        generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { 
          status: status,
          ...(generatedCode && { qrCode: generatedCode }) // Safely saves the code to the database!
      }
    })

    return NextResponse.json({ success: true, application }, { status: 200 })
  } catch (error) {
    console.error("UPDATE_APPLICANT_ERROR:", error)
    return NextResponse.json({ message: "Failed to update application status" }, { status: 500 })
  }
}