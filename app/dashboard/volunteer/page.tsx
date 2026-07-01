"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function VolunteerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  
  // App State
  const [appliedEventIds, setAppliedEventIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [message, setMessage] = useState({ text: "", type: "" })

  // 🚀 NEW: Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLocation, setFilterLocation] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return router.push("/login")
    
    const parsedUser = JSON.parse(storedUser)

    if (parsedUser.role === "ADMIN") return router.push("/dashboard/admin")
    if (parsedUser.role !== "VOLUNTEER") return router.push("/dashboard/ngo") 

    setUser(parsedUser)
    fetchDashboardData(parsedUser.id)
  }, [router])

  const fetchDashboardData = async (userId: string) => {
    try {
      const eventsResponse = await fetch("/api/events")
      const eventsData = await eventsResponse.json()
      
      const appsResponse = await fetch("/api/my-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      const appsData = await appsResponse.json()

      if (eventsData.success) {
        setEvents(eventsData.events)
      }
      
      if (appsData.success && appsData.applications) {
        const myAppliedIds = appsData.applications.map((app: any) => app.requirementId)
        setAppliedEventIds(myAppliedIds)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (eventId: string) => {
    setApplyingId(eventId)
    setMessage({ text: "", type: "" })
    
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, volunteerId: user.id })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to apply.")
      
      setMessage({ text: "✅ Successfully applied! The NGO will review your application.", type: "success" })
      setAppliedEventIds((prev) => [...prev, eventId])
    } catch (error: any) {
      setMessage({ text: `❌ ${error.message}`, type: "error" })
    } finally {
      setApplyingId(null)
    }
  }

  // 🚀 NEW: Dynamic Search & Filter Logic
  const uniqueLocations = Array.from(new Set(events.map(e => e.location).filter(Boolean)))

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.creator?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = filterLocation ? event.location === filterLocation : true;
    
    return matchesSearch && matchesLocation;
  })

  if (loading || !user)
    return <div className="min-h-screen flex items-center justify-center font-black text-gray-900 text-xl">Loading Volunteer Feed...</div>

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "V"

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-200 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Volunteer Feed</h1>
            <p className="text-gray-500 font-medium mt-1">
              Welcome back, <span className="text-green-600 font-bold">{user.name}</span>! Find your next drive in India.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6">
            <div className="hidden lg:flex items-center gap-3 mr-2">
              <button onClick={() => router.push('/submit-complaint')} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-xl transition shadow-sm">⚠️ Report Issue</button>
              <button onClick={() => router.push('/dashboard/my-complaints')} className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition shadow-sm">🎫 My Tickets</button>
            </div>

            <Link href="/dashboard/volunteer/wallet" className="bg-gray-900 text-white font-bold px-5 py-3 rounded-2xl hover:bg-black transition shadow-md flex items-center gap-2 border border-gray-700">💳 My Wallet</Link>

            <button onClick={() => router.push('/dashboard/volunteer/profile')} className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-100 transition group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-600 to-green-400 text-white flex items-center justify-center font-bold text-xl shadow-sm border-2 border-white group-hover:scale-105 transition-transform">{initial}</div>
              <span className="font-extrabold text-gray-800 text-lg hidden sm:block">Profile</span>
            </button>

            <button onClick={() => router.push('/dashboard/volunteer/my-applications')} className="bg-purple-50 text-purple-700 font-bold px-5 py-3 rounded-2xl hover:bg-purple-100 transition border border-purple-200">My Applications</button>
            <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
            <button onClick={() => { localStorage.removeItem("user"); router.push("/login") }} className="bg-red-50 text-red-600 font-bold px-6 py-3 rounded-2xl hover:bg-red-100 transition">Logout</button>
          </div>
        </header>

        {message.text && (
          <div className={`p-4 rounded-2xl text-sm font-black border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* 🚀 NEW: SEARCH & FILTER BAR */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-200">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Search drives by title, description, or NGO..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:ring-0 outline-none font-bold text-gray-900 transition"
            />
          </div>
          <div className="md:w-64">
            <select 
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:ring-0 outline-none font-bold text-gray-900 transition bg-white cursor-pointer"
            >
              <option value="">🌍 All Locations</option>
              {uniqueLocations.map((loc: any) => (
                <option key={loc} value={loc}>📍 {loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Feed */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900">Open Opportunities</h2>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-black">{filteredEvents.length} Drives Found</span>
          </div>
          
          {events.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500 font-bold text-xl mb-4">No active drives right now.</p>
              <p className="text-gray-400 font-medium">Check back later when NGOs post new requirements.</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            // 🚀 NEW: Empty state for when Search/Filter finds nothing
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-300 text-center">
              <span className="text-5xl mb-4 block">🕵️‍♂️</span>
              <p className="text-gray-900 font-black text-2xl mb-2">No matches found</p>
              <p className="text-gray-500 font-medium mb-6">Try adjusting your search words or location filter.</p>
              <button onClick={() => {setSearchQuery(""); setFilterLocation("")}} className="bg-gray-100 text-gray-800 font-bold px-6 py-3 rounded-2xl hover:bg-gray-200 transition">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event) => {
                
                const hasApplied = appliedEventIds.includes(event.id)

                return (
                  <div key={event.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-widest line-clamp-1 max-w-[60%]">
                          {event.creator?.name || "Verified NGO"}
                        </span>
                        <span className="font-black text-green-700 text-lg bg-green-50 px-3 py-1 rounded-xl shadow-sm border border-green-100">
                          ₹{event.amount}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm font-medium mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 border-t border-gray-100 pt-4 mb-2">
                        <div className="flex items-center text-xs font-bold text-gray-600 gap-2">
                          <span className="bg-gray-100 p-1.5 rounded-lg">📍</span> <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center text-xs font-bold text-gray-600 gap-2">
                          <span className="bg-gray-100 p-1.5 rounded-lg">📅</span> {new Date(event.date).toLocaleDateString('en-IN')} at {event.time}
                        </div>
                        <div className="flex items-center text-xs font-bold text-gray-600 gap-2">
                          <span className="bg-gray-100 p-1.5 rounded-lg">👥</span> {event.volunteersNeeded} Spots Open
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
                      
                      <button 
                      onClick={() => handleApply(event.id)}
                      disabled={applyingId === event.id || hasApplied}
                      className={`w-full py-3.5 rounded-xl font-black text-sm transition shadow-sm ${
                        hasApplied 
                        ? "bg-green-100 text-green-800 border border-green-200 cursor-not-allowed" 
                        : "bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                       }`}
                       >
                        {applyingId === event.id ? "Applying..." : hasApplied ? "✅ Applied" : "Apply Now"}
                        </button>
                        
                        {/* NEW WHATSAPP SHARE BUTTON */}
                        <button 
                        onClick={() => {
                          const text = `Hey! I found this volunteer drive on Samarpan: *${event.title}* in ${event.location}. They are paying ₹${event.amount}! Want to join me?`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="w-full py-3 bg-[#25D366] text-white rounded-xl font-black text-sm hover:bg-[#1ebe5d] transition shadow-sm flex justify-center items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
      </svg>
      Invite Friends
      </button>

  <button 
    onClick={() => router.push(`/submit-complaint?target=${encodeURIComponent(event.title)}`)}
    className="w-full py-2 text-[10px] font-bold text-gray-400 hover:text-red-500 transition text-center uppercase tracking-widest"
  >
    Report Drive
  </button>

</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 NEW: FOOTER */}
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