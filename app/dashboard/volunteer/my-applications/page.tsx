"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"

export default function MyApplications() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)

    if (parsedUser.role !== "VOLUNTEER") {
      router.push("/dashboard/ngo")
      return
    }

    setUser(parsedUser)
    fetchMyApplications(parsedUser.id)
  }, [router])

  const fetchMyApplications = async (userId: string) => {
    try {
      const response = await fetch("/api/my-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })

      const data = await response.json()

      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user)
    return (
      <div className="p-10 text-center font-black text-gray-900">
        Loading your applications...
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              My Applications
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Track the status of the drives you applied for.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/volunteer')}
            className="text-blue-700 font-black hover:underline bg-blue-50 px-5 py-3 rounded-2xl"
          >
            ← Back to Feed
          </button>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-500 font-bold text-xl mb-4">
              You haven't applied to any drives yet.
            </p>
            <button
              onClick={() => router.push('/dashboard/volunteer')}
              className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition"
            >
              Find Opportunities
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {applications.map((app) => (

              <div
                key={app.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
              >

                <div className="flex justify-between items-start mb-4">

                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-gray-100 text-gray-700 uppercase tracking-wider">
                    {app.requirement?.creator?.name || "Verified NGO"}
                  </span>

                  <span
                    className={`px-4 py-1 rounded-xl text-xs font-black uppercase tracking-wide border ${
                      app.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : app.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    {app.status === 'APPROVED' ? '🎉 APPROVED' : app.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-2">
                  {app.requirement?.title}
                </h3>

                <div className="space-y-3 border-t border-gray-100 pt-4 mt-4">

                  <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                    <span className="flex items-center gap-2">
                      <span>📍</span> Location
                    </span>
                    <span className="truncate max-w-[120px]">
                      {app.requirement?.location}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-gray-700">
                    <span className="flex items-center gap-2">
                      <span>📅</span> Date
                    </span>
                    <span>
                      {new Date(app.requirement?.date).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-green-700 bg-green-50 p-3 rounded-xl mt-4 border border-green-100">
                    <span>Expected Payout</span>
                    <span className="text-lg">
                      ₹{app.requirement?.amount}
                    </span>
                  </div>
                </div>

                {/* APPROVED SECTION */}
                {app.status === 'APPROVED' && (
                  <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200 flex flex-col items-center bg-gray-50 rounded-2xl p-6">

                    {/* ✅ NEW MESSAGE BUTTON */}
                    <button 
                      onClick={() => router.push(`/dashboard/chat/${app.id}`)}
                      className="mb-6 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-black text-sm hover:bg-blue-100 transition shadow-sm border border-blue-200 flex justify-center items-center gap-2"
                    >
                      💬 Message NGO
                    </button>

                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">
                      My QR for This Event
                    </p>

                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col items-center w-full">
                      {/* 🚀 FIX: The QR now properly encodes the 6-digit secret code! */}
                      <QRCode value={app.qrCode || "PENDING"} size={160} level="H" />
                      
                      {/* 🚀 FIX: The 6-digit code is now displayed below the QR! */}
                      <div className="mt-6 text-center w-full bg-gray-50 py-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Manual Verification Code</p>
                        <p className="text-3xl font-black font-mono tracking-[0.3em] text-gray-900 uppercase">
                          {app.qrCode || "------"}
                        </p>
                      </div>
                    </div>

                    <div className="text-center w-full">
                      <p className="text-sm font-bold text-gray-900 bg-white border border-gray-200 py-3 rounded-xl shadow-sm">
                        Show QR or Code to the NGO on arrival
                      </p>
                    </div>

                  </div>
                )}

                {/* COMPLETED CERTIFICATE SECTION */}
                {app.status === 'COMPLETED' && (
                  <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border border-yellow-200 text-center flex flex-col items-center">

                      <span className="text-4xl mb-3">🏆</span>

                      <h4 className="font-black text-yellow-800 text-lg mb-1">
                        Drive Completed!
                      </h4>

                      <p className="text-xs font-bold text-yellow-600 mb-4 uppercase tracking-wide">
                        Thank you for your service
                      </p>

                      <button
                        onClick={() => router.push(`/dashboard/volunteer/certificate/${app.id}`)}
                        className="w-full py-3 bg-yellow-500 text-yellow-950 rounded-xl font-black text-sm hover:bg-yellow-400 transition shadow-sm border border-yellow-600 flex justify-center items-center gap-2"
                      >
                        📜 View Certificate
                      </button>

                    </div>
                  </div>
                )}

              </div>

            ))}

          </div>
        )}
      </div>
    </div>
  )
}