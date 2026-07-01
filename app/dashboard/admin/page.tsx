"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [stats, setStats] = useState({ totalVolunteers: 0, totalNGOs: 0, totalMoneyImpact: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    // 🛡️ Strict Security: Kick out anyone who isn't an ADMIN
    if (parsedUser.role !== "ADMIN") {
      alert("Access Denied: Admins Only")
      router.push("/login")
      return
    }

    setAdmin(parsedUser)
    fetchAdminData()
  }, [router])

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard")
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        setUsers(data.users)
        setComplaints(data.complaints)
      }
    } catch (error) {
      console.error("Failed to fetch admin data")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBan = async (userId: string, isCurrentlyBanned: boolean) => {
    const action = isCurrentlyBanned ? "UNBAN" : "BAN"
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

    try {
      const res = await fetch("/api/admin/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      })
      const data = await res.json()

      if (data.success) {
        // Update the UI instantly without reloading the page
        setUsers(users.map(u => u.id === userId ? { ...u, isBanned: data.user.isBanned } : u))
      } else {
        alert(data.message || "Action failed")
      }
    } catch (error) {
      alert("Network error.")
    }
  }

  const handleResolveComplaint = async (complaintId: string) => {
    // 🚀 NEW: Ask the Admin for a reply message before resolving!
    const replyMessage = window.prompt("Enter your reply to the user (or leave blank for default):")
    
    // If they clicked "Cancel" on the prompt, abort the action
    if (replyMessage === null) return 

    try {
      const res = await fetch("/api/admin/resolve-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId, reply: replyMessage })
      })
      const data = await res.json()

      if (data.success) {
        setComplaints(complaints.map(c => 
          c.id === complaintId ? { ...c, status: "RESOLVED", adminReply: replyMessage || "Issue resolved by Admin." } : c
        ))
      } else {
        alert(data.message || "Failed to resolve.")
      }
    } catch (error) {
      alert("Network error.")
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-900">Loading Master Control...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-900 text-white p-6 rounded-3xl shadow-xl">
          <div>
            <h1 className="text-3xl font-black tracking-tight">System Control Center</h1>
            <p className="text-gray-400 font-medium mt-1">Logged in as Super Admin: {admin?.name}</p>
          </div>
          <button 
            onClick={() => { 
              localStorage.removeItem("user")
              router.push("/login")
            }} 
            className="bg-red-500 text-white font-black px-6 py-3 rounded-xl hover:bg-red-600 transition shadow-lg"
          >
            System Logout
          </button>
        </div>

        {/* Global Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Total Volunteers</p>
            <h2 className="text-5xl font-black text-blue-600">{stats.totalVolunteers}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Verified NGOs</p>
            <h2 className="text-5xl font-black text-purple-600">{stats.totalNGOs}</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Total Economic Impact</p>
            <h2 className="text-5xl font-black text-green-500">₹{stats.totalMoneyImpact}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Management Table (Takes up 2/3 of the screen) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 overflow-hidden">
            <h2 className="text-xl font-black text-gray-900 mb-6">User Database</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="pb-3 font-black text-gray-500 uppercase tracking-wider text-xs">Name</th>
                    <th className="pb-3 font-black text-gray-500 uppercase tracking-wider text-xs">Role</th>
                    <th className="pb-3 font-black text-gray-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="pb-3 font-black text-gray-500 uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-4 font-bold text-gray-900">
                        {user.name} <br/> <span className="text-xs text-gray-400 font-medium">{user.email}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${user.role === 'NGO' ? 'bg-purple-100 text-purple-700' : user.role === 'ADMIN' ? 'bg-gray-900 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`font-bold text-sm ${user.isBanned ? 'text-red-600' : 'text-green-600'}`}>
                          {user.isBanned ? "🚫 BANNED" : "✅ Active"}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        {user.role !== "ADMIN" && (
                          <button
                            onClick={() => handleToggleBan(user.id, user.isBanned)}
                            className={`px-4 py-2 rounded-xl text-sm font-black transition ${user.isBanned ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                          >
                            {user.isBanned ? "Unban User" : "Ban User"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Complaints Feed (Takes up 1/3 of the screen) */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 overflow-hidden flex flex-col h-[600px]">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex justify-between items-center">
              Active Complaints
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">{complaints.length}</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {complaints.length === 0 ? (
                <div className="text-center p-6 text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-2xl">
                  No complaints filed yet.
                </div>
              ) : (
                complaints.map(complaint => (
                  <div key={complaint.id} className={`p-4 rounded-2xl border transition-colors duration-300 ${complaint.status === 'RESOLVED' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                    <h3 className="font-black text-gray-900 text-lg mb-1">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 font-medium mb-3">{complaint.description}</p>
                    
                    {/* 🚀 Updated Complaint Footer with Resolve Button */}
                    <div className={`flex justify-between items-center text-xs mt-3 pt-3 border-t ${complaint.status === 'RESOLVED' ? 'border-green-100/50' : 'border-red-100/50'}`}>
                      <span className="font-bold text-gray-500">By: {complaint.user?.name}</span>
                      
                      <div className="flex items-center gap-3">
                        <span className={`font-black ${complaint.status === 'RESOLVED' ? 'text-green-600' : 'text-red-600'}`}>
                          {complaint.status}
                        </span>
                        
                        {complaint.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleResolveComplaint(complaint.id)}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-black transition shadow-sm"
                          >
                            Resolve ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}