import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // 1. Fetch all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isBanned: true, createdAt: true }
    })

    // 2. Fetch all complaints
    const allComplaints = await prisma.complaint.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    })

    // 3. Calculate Platform Stats
    const totalVolunteers = allUsers.filter(u => u.role === "VOLUNTEER").length
    const totalNGOs = allUsers.filter(u => u.role === "NGO").length
    
    // Total money processed (sum of all completed requirements)
    const completedDrives = await prisma.requirement.findMany({
      where: { applications: { some: { status: "COMPLETED" } } }
    })
    const totalMoneyImpact = completedDrives.reduce((sum, drive) => sum + (Number(drive.amount) || 0), 0)

    return NextResponse.json({
      success: true,
      stats: { totalVolunteers, totalNGOs, totalMoneyImpact },
      users: allUsers,
      complaints: allComplaints
    }, { status: 200 })

  } catch (error) {
    console.error("ADMIN_DASHBOARD_ERROR:", error)
    return NextResponse.json({ message: "Failed to fetch admin data" }, { status: 500 })
  }
}