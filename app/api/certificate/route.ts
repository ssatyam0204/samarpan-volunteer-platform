import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { applicationId } = await req.json()

    if (!applicationId) return NextResponse.json({ message: "Application ID is required" }, { status: 400 })

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        volunteer: { select: { name: true } },
        requirement: {
          include: {
            creator: { select: { name: true } }
          }
        }
      }
    })

    if (!application) return NextResponse.json({ message: "Certificate not found" }, { status: 404 })

    return NextResponse.json({ success: true, application }, { status: 200 })
  } catch (error) {
    console.error("CERTIFICATE_ERROR:", error)
    return NextResponse.json({ message: "Failed to generate certificate data" }, { status: 500 })
  }
}