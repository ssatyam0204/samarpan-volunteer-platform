"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function NGOProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ phone: "", bio: "", upiId: "" })
  const [message, setMessage] = useState({ type: "", text: "" })
  
  // New state for specific field errors
  const [errors, setErrors] = useState({ phone: "", upiId: "" })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    setFormData({
      phone: parsedUser.phone || "",
      bio: parsedUser.bio || "",
      upiId: parsedUser.upiId || ""
    })
  }, [router])

  // Validation Logic (BSc-CS Level)
  const validateForm = () => {
    let isValid = true
    let newErrors = { phone: "", upiId: "" }

    // Validate Indian Phone Number (10 digits)
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '').slice(-10))) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number."
      isValid = false
    }

    // Validate UPI ID format (text@bank)
    if (formData.upiId && !/^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/.test(formData.upiId)) {
      newErrors.upiId = "Invalid UPI format. Example: ngo@okhdfc"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    setMessage({ type: "", text: "" })
    
    // Stop the save if validation fails!
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors below before saving." })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          phone: formData.phone,
          bio: formData.bio,
          upiId: formData.upiId
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Failed to update")

      localStorage.setItem("user", JSON.stringify(data.user))
      setUser(data.user)
      setIsEditing(false)
      setMessage({ type: "success", text: "Profile updated successfully!" })
      
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="p-10 text-center text-gray-900 font-bold">Loading Organization Details...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-300 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Organization Profile</h1>
          <button onClick={() => router.push('/dashboard/ngo')} className="text-blue-700 text-sm font-bold hover:underline">
            ← Back to Dashboard
          </button>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {message.text}
          </div>
        )}
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Organization Name</label>
              <div className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 font-bold">
                {user.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">System Verification</label>
              {user.isVerified ? (
                <div className="inline-flex items-center px-4 py-2 rounded-lg font-extrabold bg-green-100 text-green-800 border border-green-300">
                  ✅ VERIFIED
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 rounded-lg font-extrabold bg-yellow-100 text-yellow-800 border border-yellow-300">
                  ⏳ PENDING APPROVAL
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {isEditing ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 9876543210" 
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value})
                    setErrors({...errors, phone: ""}) // Clear error on typing
                  }}
                  className={`w-full p-3 border rounded-xl font-medium text-gray-900 focus:ring-2 outline-none ${errors.phone ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-400 focus:ring-blue-600'}`} 
                />
                {errors.phone && <p className="text-red-600 text-xs font-bold mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Organization Bio</label>
                <textarea 
                  rows={3} 
                  placeholder="What is your NGO's mission?"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-3 border border-gray-400 rounded-xl font-medium text-gray-900 focus:ring-2 focus:ring-blue-600 outline-none" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">UPI ID (For Event Payments)</label>
                <input 
                  type="text" 
                  placeholder="example@okaxis" 
                  value={formData.upiId}
                  onChange={(e) => {
                    setFormData({...formData, upiId: e.target.value})
                    setErrors({...errors, upiId: ""}) // Clear error on typing
                  }}
                  className={`w-full p-3 border rounded-xl font-medium text-gray-900 focus:ring-2 outline-none ${errors.upiId ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-400 focus:ring-blue-600'}`} 
                />
                {errors.upiId && <p className="text-red-600 text-xs font-bold mt-1">{errors.upiId}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-extrabold hover:bg-blue-800 transition shadow-md disabled:opacity-50"
                >
                  {loading ? "Saving Data..." : "Save Details"}
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false)
                    setErrors({phone: "", upiId: ""}) // Clear errors on cancel
                  }} 
                  className="flex-1 py-3 bg-gray-200 text-gray-900 rounded-xl font-extrabold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Phone Number</label>
                <p className="text-gray-900 font-medium text-lg">{user.phone || <span className="text-gray-500 italic text-base">Not provided</span>}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Organization Bio</label>
                <p className="text-gray-900 font-medium text-lg">{user.bio || <span className="text-gray-500 italic text-base">Not provided</span>}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">UPI ID</label>
                <p className="text-gray-900 font-medium text-lg">{user.upiId || <span className="text-gray-500 italic text-base">Not provided</span>}</p>
              </div>

              <div className="pt-6 border-t border-gray-200 mt-6">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-blue-700 text-white rounded-xl font-extrabold hover:bg-blue-800 transition shadow-md"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}