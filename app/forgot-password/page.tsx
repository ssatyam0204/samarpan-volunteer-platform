"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ForgotPassword() {
  const router = useRouter()
  
  const [step, setStep] = useState(1) // Step 1: Request OTP, Step 2: Reset Password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ text: "✅ OTP sent to your email!", type: "success" })
        setStep(2) // Move to the next screen!
      } else {
        setMessage({ text: `❌ ${data.message}`, type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Network error occurred.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword })
      })
      const data = await res.json()

      if (res.ok) {
        alert("✅ Password successfully reset! Please login with your new password.")
        router.push("/login")
      } else {
        setMessage({ text: `❌ ${data.message}`, type: "error" })
      }
    } catch (error) {
      setMessage({ text: "Network error occurred.", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center font-black text-white text-3xl shadow-md mx-auto mb-4">
          S
        </div>
        <h2 className="text-3xl font-black text-gray-900">
          {step === 1 ? "Reset your password" : "Enter Verification Code"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          {step === 1 ? "We'll send a 6-digit OTP to your email." : `Code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-3xl sm:px-10">
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-bold border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {message.text}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  /* 🚀 Added text-gray-900 here! */
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50 transition"
              >
                {loading ? "Sending..." : "Send OTP Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">6-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  /* 🚀 Added text-gray-900 here! */
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-2xl tracking-widest text-center font-black transition"
                  placeholder="------"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  /* 🚀 Added text-gray-900 here! */
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  placeholder="Enter a strong password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-gray-900 bg-green-400 hover:bg-green-500 focus:outline-none disabled:opacity-50 transition"
              >
                {loading ? "Verifying..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}