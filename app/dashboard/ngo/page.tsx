"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NGODashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  
  // 🚀 NEW: State to hold live dashboard metrics
  const [pendingAppsCount, setPendingAppsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    
    const parsedUser = JSON.parse(storedUser)
    
    if (parsedUser.role === "ADMIN") return router.push("/dashboard/admin")
    if (parsedUser.role !== "NGO") return router.push("/dashboard/volunteer") 
    
    setUser(parsedUser)
    fetchDashboardMetrics(parsedUser.id)
  }, [router])

  // 🚀 NEW: Fetch applicants to show real-time notifications on the dashboard
  const fetchDashboardMetrics = async (ngoId: string) => {
    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ngoId }) // Uses your existing API perfectly!
      })
      const data = await res.json()
      
      if (data.success && data.applications) {
        // Count how many applications are currently PENDING
        const pendingCount = data.applications.filter((app: any) => app.status === 'PENDING').length
        setPendingAppsCount(pendingCount)
      }
    } catch (error) {
      console.error("Failed to fetch metrics", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center font-black text-gray-900 text-xl">Loading NGO Console...</div>

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "N"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">NGO Console</h1>
            <p className="text-gray-500 font-medium mt-1">
              Welcome back, <span className="text-blue-600 font-bold">{user.name}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6">
            
            <div className="hidden lg:flex items-center gap-3 mr-2">
              <button onClick={() => router.push('/submit-complaint')} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-xl transition shadow-sm">
                ⚠️ Report Issue
              </button>
              <button onClick={() => router.push('/dashboard/my-complaints')} className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition shadow-sm">
                🎫 My Tickets
              </button>
            </div>

            <button onClick={() => router.push('/dashboard/ngo/profile')} className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-100 transition group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white group-hover:scale-105 transition-transform">
                {initial}
              </div>
              <span className="font-extrabold text-gray-800 text-lg hidden sm:block">Profile</span>
            </button>

            <div className="w-px h-10 bg-gray-200 hidden md:block"></div>

            <button onClick={() => { localStorage.removeItem("user"); router.push("/login"); }} className="bg-red-50 text-red-600 font-bold px-6 py-3 rounded-2xl hover:bg-red-100 transition">
              Logout
            </button>
          </div>
        </header>

        {/* 🚀 NEW: Quick Verification Warning Banner */}
        {!user.isVerified && (
           <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
             <div>
               <h3 className="text-yellow-800 font-black text-lg flex items-center gap-2">⚠️ Account Pending Verification</h3>
               <p className="text-yellow-700 font-medium text-sm mt-1">Volunteers are more likely to apply to verified NGOs. Please complete your profile KYC.</p>
             </div>
             <button onClick={() => router.push('/dashboard/ngo/profile')} className="bg-yellow-100 text-yellow-800 font-black px-6 py-3 rounded-xl hover:bg-yellow-200 transition whitespace-nowrap">
               Verify Now →
             </button>
           </div>
        )}

        {/* 🚀 NEW: Live Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl border border-purple-100">📋</div>
            <div>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Pending Applications</p>
              <h4 className="text-3xl font-black text-gray-900">{pendingAppsCount}</h4>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Create Event Card */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-600 p-8 rounded-3xl text-white shadow-md flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black">Post a Requirement</h2>
              <p className="mt-3 text-blue-100 font-medium mb-8 text-lg leading-relaxed">
                Create a new volunteer drive, set the payout, and find people to help your cause.
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/ngo/create-event')}
              className="relative z-10 bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all w-full md:w-auto self-start"
            >
              + Create Post
            </button>
          </div>

          {/* 2. Manage Events Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-gray-900">My Events</h2>
                {user.isVerified ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-green-100 text-green-700 border border-green-200">✅ VERIFIED</span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-yellow-100 text-yellow-700 border border-yellow-200">⏳ PENDING</span>
                )}
              </div>
              <p className="text-gray-500 font-medium mb-8 text-lg leading-relaxed">
                View your active volunteer drives and track the details of your posts.
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/ngo/my-events')}
              className="bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-black text-lg group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-700 transition w-full md:w-auto self-start"
            >
              View Active Posts →
            </button>
          </div>

          {/* 3. Review Applicants Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-purple-300 transition group relative">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-gray-900">Review Applicants</h2>
                {/* 🚀 NEW: Dynamic Notification Bubble */}
                {pendingAppsCount > 0 ? (
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-red-500 text-white animate-pulse shadow-sm">
                    {pendingAppsCount} PENDING
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg text-xs font-black bg-purple-100 text-purple-700 border border-purple-200">⭐ NEW</span>
                )}
              </div>
              <p className="text-gray-500 font-medium mb-8 text-lg leading-relaxed">
                See exactly who applied to your drives and instantly approve or verify them.
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/ngo/applicants')}
              className={`border px-8 py-4 rounded-2xl font-black text-lg transition w-full md:w-auto self-start ${
                pendingAppsCount > 0 
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-900 border-gray-200 group-hover:bg-purple-50 group-hover:border-purple-200 group-hover:text-purple-700'
              }`}
            >
              View Applications →
            </button>
          </div>

        </div>
      </div>

      {/* 🚀 NEW: Consistent Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Samarpan</h2>
            <p className="text-sm font-bold text-gray-400 mt-1">Empowering India's Volunteers & NGOs.</p>
          </div>
          <div className="flex gap-6 text-sm font-bold text-gray-500">
            <Link href="#" className="hover:text-gray-900 transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-900 transition">Terms of Service</Link>
            <Link href="/submit-complaint" className="hover:text-gray-900 transition">Contact Support</Link>
          </div>
          <div className="text-sm font-bold text-gray-400">
            © {new Date().getFullYear()} Samarpan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}