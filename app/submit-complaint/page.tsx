"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function ComplaintForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🚀 SMART FEATURE: Grabs the target name from the URL if it exists!
  const target = searchParams.get("target") 

  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState(target ? `Issue regarding: ${target}` : "")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return router.push("/login")
    setUser(JSON.parse(storedUser))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, title, description })
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "✅ Complaint submitted successfully. You can track this in your Support Dashboard.", type: "success" })
        setTitle("")
        setDescription("")
      } else {
        setMessage({ text: `❌ ${data.message}`, type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Network error occurred.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-gray-900">Report an Issue</h1>
        <button onClick={() => router.back()} className="text-sm font-bold text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
          ← Back
        </button>
      </div>
      
      <p className="text-gray-500 font-medium mb-8">
        {target ? `Filing a report concerning: ${target}` : "Experiencing an issue? Let our Admin team know."}
      </p>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Issue Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 focus:ring-red-500 focus:border-red-500 font-medium"
            placeholder="e.g., Payment delayed for cleanup drive"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 focus:ring-red-500 focus:border-red-500 font-medium"
            placeholder="Please provide as much detail as possible..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-black text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50 transition"
        >
          {loading ? "Submitting..." : "Submit to Admin"}
        </button>
        
        {/* Quick link to view their own complaints */}
        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => router.push('/dashboard/my-complaints')}
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            View My Past Complaints & Status →
          </button>
        </div>
      </form>
    </div>
  )
}

export default function SubmitComplaintPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pt-20">
      <Suspense fallback={<div className="font-black text-gray-500">Loading Form...</div>}>
        <ComplaintForm />
      </Suspense>
    </div>
  )
}