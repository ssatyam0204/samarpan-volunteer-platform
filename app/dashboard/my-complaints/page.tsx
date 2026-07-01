"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MyComplaints() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return router.push("/login")
    
    const parsedUser = JSON.parse(storedUser)
    fetchMyComplaints(parsedUser.id)
  }, [router])

  const fetchMyComplaints = async (userId: string) => {
    try {
      const res = await fetch("/api/my-complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.success) {
        setComplaints(data.complaints)
      }
    } catch (error) {
      console.error("Failed to fetch complaints")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-10 text-center font-bold text-gray-900">Loading Support Tickets...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Track the status of your reported issues.</p>
          </div>
          <button 
            onClick={() => router.back()} 
            className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-2xl hover:bg-gray-200 transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          {complaints.length === 0 ? (
            <div className="text-center p-10 text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-2xl">
              You haven't submitted any complaints yet.
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map(complaint => (
                <div key={complaint.id} className="p-5 rounded-2xl border border-gray-100 hover:border-gray-300 transition shadow-sm bg-gray-50/50 flex flex-col md:flex-row justify-between md:items-start gap-4">
                  
                  <div className="flex-1 w-full">
                    <h3 className="font-black text-gray-900 text-lg">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 font-medium mt-1">{complaint.description}</p>
                    
                    {/* 🚀 NEW: Display the Admin's Reply if it exists! */}
                    {complaint.adminReply && (
                      <div className="mt-4 p-4 bg-white rounded-xl border border-green-200 shadow-sm">
                        <span className="font-black text-green-700 text-xs uppercase tracking-wider block mb-1">Admin Reply:</span>
                        <span className="text-gray-800 font-bold text-sm">{complaint.adminReply}</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 font-bold mt-4">
                      Submitted on: {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex-shrink-0 mt-2 md:mt-0">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider inline-block ${
                      complaint.status === 'RESOLVED' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {complaint.status === 'RESOLVED' ? "✅ RESOLVED" : "⏳ ADMIN REVIEWING"}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}