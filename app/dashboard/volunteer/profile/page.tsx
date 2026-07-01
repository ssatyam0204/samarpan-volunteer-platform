"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function VolunteerProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Combined Form State for both Setup & Editing
  const [formData, setFormData] = useState({
    name: "", phone: "", dob: "", aadharNumber: "",
    address: "", city: "", state: "", pincode: "",
    bloodGroup: "", upiId: "", bio: "",
    profileImage: ""
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)

    const fetchMyProfile = async () => {
      try {
        const response = await fetch("/api/volunteer-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volunteerId: parsedUser.id })
        })

        const data = await response.json()

        if (data.success) {
          setProfile(data.volunteer)
          
          setFormData({
            name: data.volunteer.name || "",
            phone: data.volunteer.phone || "",
            dob: data.volunteer.dob || "",
            aadharNumber: data.volunteer.aadharNumber || "",
            address: data.volunteer.address || "",
            city: data.volunteer.city || "",
            state: data.volunteer.state || "",
            pincode: data.volunteer.pincode || "",
            bloodGroup: data.volunteer.bloodGroup || "",
            upiId: data.volunteer.upiId || "",
            bio: data.volunteer.bio || "",
            profileImage: data.volunteer.profileImage || ""
          })

          if (!data.volunteer.isVerified) {
            setIsEditing(true)
          }
        }
      } catch (error) {
        console.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchMyProfile()
  }, [router])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return alert("Name cannot be empty!")
    if (!formData.aadharNumber.trim() || formData.aadharNumber.length !== 12) {
        return alert("Please enter a valid 12-digit Aadhar Number.")
    }

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\D/g, '')
      if (cleanPhone.length !== 10 && cleanPhone.length !== 12) {
        return alert("Please enter a valid 10-digit phone number.")
      }
    }

    if (formData.upiId.trim()) {
      const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9\-]+$/
      if (!upiRegex.test(formData.upiId)) {
        return alert("Please enter a valid UPI ID (e.g., username@okhdfcbank).")
      }
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert("Profile & KYC updated successfully!")
        
        setProfile(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsEditing(false)
        
        if (!profile.isVerified) {
             router.push('/dashboard/volunteer')
        }

      } else {
        alert(data.message || "Failed to update")
      }
    } catch (error) {
      alert("Network error. Try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-gray-900">
        Loading Your Profile...
      </div>
    )

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-red-600">
        Error loading profile.
      </div>
    )

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "V"

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <button
            onClick={() => router.push('/dashboard/volunteer')}
            className="text-green-700 font-black hover:underline bg-green-50 px-5 py-2 rounded-xl border border-green-200"
          >
            ← Back to Feed
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          
          {!profile.isVerified && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-800 font-medium">
              ⚠️ <span className="font-bold">Action Required:</span> Please complete your KYC details below to verify your account and start applying for drives.
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

            {/* IMAGE UPLOADER (REPLACED AVATAR CIRCLE) */}
            <div className="relative group cursor-pointer w-32 h-32 shrink-0">
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) return alert("Image must be less than 2MB");
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, profileImage: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              {formData.profileImage || profile.profileImage ? (
                <img 
                  src={formData.profileImage || profile.profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white ring-4 ring-green-50"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-white flex items-center justify-center font-black text-5xl shadow-lg border-4 border-white ring-4 ring-green-50">
                  {initial}
                </div>
              )}

              <div className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full shadow-md z-10 group-hover:scale-110 transition">
                📷
              </div>
            </div>

            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                    </div>
                  </div>

                  {/* KYC Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Aadhar Number</label>
                      <input type="text" name="aadharNumber" maxLength={12} value={formData.aadharNumber} onChange={handleChange} placeholder="12 Digit Aadhar" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-mono tracking-widest text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                    </div>
                  </div>

                  {/* Address Info */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Full Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900 mb-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                      <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Pincode" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                    </div>
                  </div>

                  {/* Platform Specific */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">UPI ID (For Payouts)</label>
                      <input type="text" name="upiId" value={formData.upiId} onChange={handleChange} placeholder="username@upi" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Blood Group</label>
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900 bg-white">
                        <option value="">Select...</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Bio / Skills</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Tell NGOs about your skills..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 focus:ring-0 outline-none font-semibold text-gray-900" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-black text-lg hover:bg-green-700 disabled:opacity-50 transition shadow-md">
                      {isSaving ? "Saving..." : "Save Profile & Verify"}
                    </button>
                    {profile.isVerified && (
                      <button onClick={() => setIsEditing(false)} className="px-6 py-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-black text-gray-900">{profile.name}</h2>
                    {profile.isVerified && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black border border-green-200">✅ VERIFIED</span>}
                  </div>
                  <p className="text-gray-500 font-bold text-lg mb-6">{profile.email}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Contact & Payment</h4>
                      <p className="font-semibold text-gray-800 mb-2">📞 {profile.phone || "Not provided"}</p>
                      <p className="font-semibold text-gray-800">💳 {profile.upiId || "Not provided"}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Emergency & KYC</h4>
                      <p className="font-semibold text-gray-800 mb-2">🩸 {profile.bloodGroup || "Not provided"}</p>
                      <p className="font-mono text-gray-800 font-bold tracking-widest">🆔 {profile.aadharNumber ? '•••• •••• ' + profile.aadharNumber.slice(-4) : 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mt-4">
                     <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Location & Bio</h4>
                     <p className="font-semibold text-gray-800 mb-3 text-sm leading-relaxed">
                       📍 {profile.address ? `${profile.address}, ${profile.city}, ${profile.state} - ${profile.pincode}` : "Location not provided"}
                     </p>
                     <p className="font-semibold text-gray-800 text-sm leading-relaxed">📝 {profile.bio || "No bio added yet."}</p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-50 text-blue-700 font-bold px-6 py-3 rounded-xl mt-6 hover:bg-blue-100 transition border border-blue-200"
                  >
                    ✏️ Edit Profile Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}