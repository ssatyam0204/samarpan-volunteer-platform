"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function VolunteerWallet() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return router.push("/login")
    
    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== "VOLUNTEER") return router.push("/dashboard/ngo")
    
    setUser(parsedUser)
    fetchWalletData(parsedUser.id)
  }, [])

  const fetchWalletData = async (volunteerId: string) => {
    try {
      const res = await fetch(`/api/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: volunteerId })
      })
      const data = await res.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error("Failed to fetch wallet data")
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    // 🏦 Realistic bank confirmation prompt!
    const confirmUpi = window.prompt(
      "🏦 Please confirm your UPI ID to receive the funds:", 
      user?.upiId || ""
    )

    if (!confirmUpi) {
      return alert("❌ Withdrawal cancelled. A valid UPI ID is required.")
    }

    setIsWithdrawing(true)

    try {
      // Simulate a 2-second bank processing delay for your presentation!
      await new Promise(resolve => setTimeout(resolve, 2000))

      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await res.json()

      if (data.success) {
        alert(`✅ SUCCESS! Bank transfer of ₹${pendingBalance} initiated to UPI: ${confirmUpi}`)
        fetchWalletData(user.id) // Refresh the balances
      } else {
        alert("❌ Transfer failed. Please try again.")
      }
    } catch (error) {
      alert("Network error during transfer.")
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (loading) return <div className="p-10 font-black text-center text-xl">Loading Secure Wallet...</div>

  // 🧮 Auto-Calculate Balances (With strict TypeScript types added!)
  const pendingBalance = applications
    .filter((app: any) => app.paymentStatus === "PENDING")
    .reduce((total: number, app: any) => total + (Number(app.requirement?.amount) || 0), 0)

  const withdrawnBalance = applications
    .filter((app: any) => app.paymentStatus === "PAID")
    .reduce((total: number, app: any) => total + (Number(app.requirement?.amount) || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      
      {/* Wallet Header Card */}
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <h1 className="text-3xl font-black mb-2 relative z-10">My Earnings Wallet</h1>
        <p className="text-gray-400 font-medium mb-8 relative z-10">Track your amount and withdraw to your saved UPI ID.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* Pending Balance Card */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-inner">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Available to Withdraw</p>
            <h2 className="text-5xl font-black text-green-400 mb-4">₹{pendingBalance}</h2>
            
            <button 
              onClick={handleWithdraw}
              disabled={pendingBalance === 0 || isWithdrawing}
              className="w-full bg-green-500 text-gray-900 py-3 rounded-xl font-black hover:bg-green-400 disabled:opacity-50 disabled:hover:bg-green-500 transition shadow-lg flex justify-center items-center gap-2"
            >
              {isWithdrawing ? "Processing Transfer..." : "Withdraw to UPI"}
            </button>
          </div>

          {/* Total Withdrawn Card */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-inner flex flex-col justify-center">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-xs mb-1">Total Lifetime Earnings</p>
            <h2 className="text-4xl font-black text-white">₹{withdrawnBalance + pendingBalance}</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Successfully Withdrawn: ₹{withdrawnBalance}</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-black text-gray-900 mb-6">Payout History</h2>
        
        {applications.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 font-bold">No completed payouts yet. Keep volunteering!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app: any) => (
              <div key={app.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <h3 className="font-black text-gray-900">{app.requirement?.title}</h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">
                    NGO: {app.requirement?.creator?.name || "Organization"}
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-lg font-black text-gray-900">₹{app.requirement?.amount || 0}</h4>
                  <span className={`text-xs font-black uppercase tracking-wider ${app.paymentStatus === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {app.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}