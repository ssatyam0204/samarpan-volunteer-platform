"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateEvent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    mapsLink: "",
    date: "",
    time: "",
    amount: "",
    volunteersNeeded: "",
    paymentMode: "WALLET"
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })
    setLoading(true)

    try {
      const response = await fetch("/api/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          creatorId: user.id 
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Failed to create event")

      setMessage({ type: "success", text: "✅ Event created successfully! Volunteers can now see it." })
      
      // Instantly clear the form so you know it worked
      setFormData({ 
        title: "", description: "", location: "", mapsLink: "", 
        date: "", time: "", amount: "", volunteersNeeded: "", paymentMode: "WALLET" 
      })
      
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ ${error.message}` })
    } finally {
      setLoading(false)
    }
  }

  // 1. Loading State
  if (!user) return <div className="p-10 text-center font-bold text-gray-900">Loading Form...</div>

  // 2. Security Check (Must be verified)
  if (user && !user.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 p-10 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-md border border-red-200 text-center max-w-md">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 font-medium mb-8 text-lg">Your NGO profile is pending approval. You cannot create events yet.</p>
          <button onClick={() => router.push('/dashboard/ngo')} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black w-full hover:bg-black transition">
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // 3. The Clean Form UI
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
        
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Post a Requirement</h1>
            <p className="text-gray-500 font-medium mt-1">Fill out the details below to broadcast your event.</p>
          </div>
          <button onClick={() => router.push('/dashboard/ngo')} className="text-blue-700 font-black hover:underline bg-blue-50 px-4 py-2 rounded-xl">
            ← Dashboard
          </button>
        </div>

        {message.text && (
          <div className={`p-4 mb-8 rounded-2xl text-sm font-black border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title & Description */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Event Title <span className="text-red-500">*</span></label>
              <input 
                required type="text" placeholder="e.g., Juhu Beach Cleanup Drive" 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition" 
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Detailed Description <span className="text-red-500">*</span></label>
              <textarea 
                required rows={4} placeholder="What exactly will the volunteers be doing?"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition" 
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Location / Area <span className="text-red-500">*</span></label>
              <input 
                required type="text" placeholder="e.g., Andheri West, Mumbai" 
                value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Google Maps Link (Optional)</label>
              <input 
                type="url" placeholder="https://maps.app.goo.gl/..." 
                value={formData.mapsLink} onChange={(e) => setFormData({...formData, mapsLink: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition" 
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Date <span className="text-red-500">*</span></label>
              <input 
                required type="date" 
                value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">Time <span className="text-red-500">*</span></label>
              <input 
                required type="time" 
                value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-black text-gray-900 focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition" 
              />
            </div>
          </div>

          {/* Highlighted Payout Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mt-6">
            <div>
              <label className="block text-sm font-black text-blue-900 mb-2">Volunteers Needed <span className="text-red-500">*</span></label>
              <input 
                required type="number" min="1" placeholder="e.g., 20" 
                value={formData.volunteersNeeded} onChange={(e) => setFormData({...formData, volunteersNeeded: e.target.value})}
                className="w-full p-4 bg-white border border-blue-200 rounded-2xl font-black text-blue-900 focus:ring-2 focus:ring-blue-600 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-blue-900 mb-2">Payout (₹) <span className="text-red-500">*</span></label>
              <input 
                required type="number" min="0" placeholder="e.g., 500" 
                value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full p-4 bg-white border border-blue-200 rounded-2xl font-black text-blue-900 focus:ring-2 focus:ring-blue-600 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-blue-900 mb-2">Mode of Payment <span className="text-red-500">*</span></label>
              <select 
                required value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                className="w-full p-4 bg-white border border-blue-200 rounded-2xl font-black text-blue-900 focus:ring-2 focus:ring-blue-600 outline-none transition"
              >
                <option value="WALLET">In-App Wallet</option>
                <option value="UPI">UPI Transfer</option>
                <option value="CASH">Cash on Spot</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100 my-8" />

          <button 
            type="submit" disabled={loading}
            className="w-full py-5 bg-blue-700 text-white rounded-2xl font-black text-xl hover:bg-blue-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "Saving to Database..." : "Publish Event Requirement"}
          </button>
        </form>

      </div>
    </div>
  )
}