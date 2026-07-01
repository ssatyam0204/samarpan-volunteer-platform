"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"

export default function ReviewApplicants() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // 🚀 NEW: Search & Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [eventFilter, setEventFilter] = useState("ALL")

  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [selectedStar, setSelectedStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)

  const [scannerAppId, setScannerAppId] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [isManualMode, setIsManualMode] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)

    if (parsedUser.role !== "NGO") {
      router.push("/dashboard/volunteer")
      return
    }

    setUser(parsedUser)
    fetchApplications(parsedUser.id)
  }, [router])

  const fetchApplications = async (ngoId: string) => {
    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: ngoId })
      })

      const data = await res.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch {
      console.error("Failed to fetch applicants")
    } finally {
      setLoading(false)
    }
  }

  const verifyAttendance = async (applicationId: string, code: string) => {
    try {
      const res = await fetch("/api/verify-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, code })
      })

      const data = await res.json()

      if (data.success) {
        alert("✅ Attendance Verified! Volunteer marked as COMPLETED.")
        closeScanner()
        if (user) fetchApplications(user.id)
      } else {
        alert(`❌ ${data.message}`)
      }
    } catch {
      alert("Network error. Try again.")
    }
  }

  const downloadCSV = () => {
  if (filteredApps.length === 0) return alert("No applications to download.");

  const headers = ["Volunteer Name","Email","Phone","Event Title","Status","Blood Group","Attendance Code"];

  const csvData = filteredApps.map(app => [
    `"${app.volunteer?.name}"`,
    `"${app.volunteer?.email}"`,
    `"${app.volunteer?.phone || 'N/A'}"`,
    `"${app.requirement?.title}"`,
    `"${app.status}"`,
    `"${app.volunteer?.bloodGroup || 'N/A'}"`,
    `"${app.qrCode || 'N/A'}"`
  ].join(","));

  const csvContent = [headers.join(","), ...csvData].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  const fileName =
    eventFilter === "ALL"
      ? "All_Applicants"
      : eventFilter.replace(/\s+/g, "_");

  link.download = `Samarpan_${fileName}.csv`;

  link.click();
};

  useEffect(() => {
    if (scannerAppId && !isManualMode) {
      const startScanner = async () => {
        html5QrCodeRef.current = new Html5Qrcode("qr-reader")

        try {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              if (html5QrCodeRef.current) html5QrCodeRef.current.stop()
              verifyAttendance(scannerAppId, decodedText)
            },
            () => {}
          )
        } catch (err) {
          console.error("Camera failed", err)
          setIsManualMode(true)
        }
      }

      startScanner()
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [scannerAppId, isManualMode])

  const toggleFlashlight = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        const newFlashState = !flashEnabled
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: newFlashState } as any]
        })
        setFlashEnabled(newFlashState)
      } catch {
        alert("Flashlight is not supported on this device.")
      }
    }
  }

  const closeScanner = () => {
    setScannerAppId(null)
    setIsManualMode(false)
    setManualCode("")
    setFlashEnabled(false)
  }

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    setProcessingId(applicationId)

    try {
      const res = await fetch("/api/applicants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status })
      })

      if (res.ok) {
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status } : app
          )
        )
      }
    } catch {
      alert("Failed to update status")
    } finally {
      setProcessingId(null)
    }
  }

  const submitRatingAndPay = async () => {
    if (!selectedAppId) return
    if (selectedStar === 0) return alert("Select rating!")

    setIsSubmitting(true)

    try {
      const res = await fetch("/api/rate-volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedAppId,
          rating: selectedStar
        })
      })

      if (res.ok) {
        setApplications(prev =>
          prev.map(app =>
            app.id === selectedAppId
              ? { ...app, rating: selectedStar, paymentStatus: "PAID" }
              : app
          )
        )

        setRatingModalOpen(false)
        setSelectedStar(0)
      }
    } catch {
      alert("Network error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const maskAadhar = (aadhar: string | null) => {
    if (!aadhar || aadhar.length < 12) return "Not provided"
    return `•••• •••• ${aadhar.slice(-4)}`
  }

  // Filter by search, status, AND event
  // Find all unique event titles for dropdown
const uniqueEvents = Array.from(
  new Set(
    applications
      .map(app => app.requirement?.title)
      .filter(Boolean)
  )
)

// Filter by search + status + event
const filteredApps = applications.filter(app => {

  const matchesSearch =
    app.volunteer?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    app.requirement?.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())

  const matchesStatus =
    statusFilter === "ALL"
      ? true
      : app.status === statusFilter

  const matchesEvent =
    eventFilter === "ALL"
      ? true
      : app.requirement?.title === eventFilter

  return matchesSearch && matchesStatus && matchesEvent
})
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black text-xl">
        Loading Applicants...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-black text-gray-900">
            Review Applicants
          </h1>
          <div className="flex gap-4">
            <button
              onClick={downloadCSV}
              className="bg-green-50 text-green-700 font-bold px-6 py-3 rounded-2xl hover:bg-green-100 transition border border-green-200 flex items-center gap-2"
            >
              📊 Download CSV
            </button>
            <button
              onClick={() => router.push('/dashboard/ngo')}
              className="bg-gray-100 text-gray-700 font-bold px-6 py-3 rounded-2xl hover:bg-gray-200 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* 🚀 NEW: Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" placeholder="Search by volunteer name or event..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-gray-900 focus:ring-0 outline-none font-bold text-gray-900 transition"
            />
          </div>

          <div className="md:w-64">
  <select
    value={eventFilter}
    onChange={(e) => setEventFilter(e.target.value)}
    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-gray-900 outline-none font-bold text-gray-900 cursor-pointer"
  >
    <option value="ALL">📅 All Events</option>

    {uniqueEvents.map((eventTitle:any) => (
      <option key={eventTitle} value={eventTitle}>
        {eventTitle}
      </option>
    ))}

  </select>
</div>

          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['ALL', 'PENDING', 'APPROVED', 'COMPLETED'].map(status => (
              <button 
                key={status} onClick={() => setStatusFilter(status)}
                className={`px-5 py-3 rounded-2xl font-black text-sm transition whitespace-nowrap ${
                  statusFilter === status ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          {filteredApps.length === 0 ? (
            <div className="text-center p-12 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
              <p className="text-gray-500 font-black text-xl">No Applications Found.</p>
            </div>
          ) : (
            filteredApps.map(app => (
              <div
                key={app.id}
                className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">

                  {/* 🚀 NEW: Profile Image on the Card */}
                  <div className="flex items-center gap-4 mb-3">
                    {app.volunteer?.profileImage ? (
                      <img src={app.volunteer.profileImage} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center font-black text-xl shadow-sm">
                        {app.volunteer?.name?.charAt(0).toUpperCase() || "V"}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        {app.volunteer?.name}
                        {app.volunteer?.isVerified && (
                          <span className="text-green-500 text-xs">✅</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        Applied for: <span className="font-bold text-gray-800">{app.requirement?.title}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProfile(app.volunteer)
                      setProfileModalOpen(true)
                    }}
                    className="text-blue-600 text-xs font-bold hover:underline mt-2 ml-1"
                  >
                    View Full Profile ↗
                  </button>

                 <button 
  onClick={() => router.push(`/dashboard/chat/${app.id}`)}
  className="ml-5 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
  Message
</button>
                </div>

                
                

                <div className="flex flex-col gap-3 items-end justify-center">

                  {app.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(app.id, "APPROVED")}
                        disabled={processingId === app.id}
                        className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                        disabled={processingId === app.id}
                        className="bg-red-50 border border-red-200 text-red-700 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {app.status === "APPROVED" && (
                    <button
                      onClick={() => setScannerAppId(app.id)}
                      className="w-full bg-gray-900 text-white font-black py-3 px-6 rounded-xl hover:bg-black transition shadow-md text-sm flex justify-center items-center gap-2"
                    >
                      📷 Scan QR / Enter Code
                    </button>
                  )}

                  {app.status === "COMPLETED" && !app.rating && (
                    <button
                      onClick={() => {
                        setSelectedAppId(app.id)
                        setRatingModalOpen(true)
                      }}
                      className="bg-yellow-400 px-6 py-3 rounded-xl font-black shadow-sm hover:bg-yellow-500 transition"
                    >
                      ⭐ Rate & Pay
                    </button>
                  )}

                  {app.rating && (
                    <div className="text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                      {"⭐".repeat(app.rating)} • {app.paymentStatus}
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {scannerAppId && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900">Verify Attendance</h2>
              <button onClick={closeScanner} className="bg-gray-100 text-gray-500 hover:text-red-600 font-black w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>

            <div className="flex p-2 bg-gray-50">
              <button onClick={() => setIsManualMode(false)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${!isManualMode ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500'}`}>
                📷 Scan QR
              </button>
              <button onClick={() => setIsManualMode(true)} className={`flex-1 py-2 rounded-xl font-bold text-sm ${isManualMode ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500'}`}>
                ⌨️ Type Code
              </button>
            </div>

            <div className="p-6">
              {!isManualMode ? (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden bg-black aspect-square border-4 border-gray-100">
                    <div id="qr-reader" className="w-full h-full"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-gray-400">Point camera at volunteer QR</p>
                    <button onClick={toggleFlashlight} className={`px-4 py-2 rounded-full font-bold text-sm ${flashEnabled ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-gray-100 text-gray-600'}`}>
                      🔦 Flash {flashEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <p className="text-center font-bold text-gray-500">
                    Ask the volunteer for the code below their QR.
                  </p>

                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    className="w-full text-center text-3xl tracking-widest font-black font-mono px-4 py-4 rounded-xl border-2 border-gray-300"
                    maxLength={8}
                  />

                  <button
                    onClick={() => verifyAttendance(scannerAppId, manualCode)}
                    className="w-full bg-gray-900 text-white font-black text-lg py-4 rounded-xl"
                  >
                    Verify Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {ratingModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[320px]">
            <h2 className="text-lg font-black mb-6 text-center">
              Rate Volunteer
            </h2>

            <div className="flex justify-center gap-3 mb-6">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedStar(star)}
                  className={`text-4xl ${
                    star <= selectedStar
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              onClick={submitRatingAndPay}
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3 rounded-xl font-black"
            >
              {isSubmitting ? "Processing..." : "Submit Rating"}
            </button>
          </div>
        </div>
      )}

      {profileModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">

            <button
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-black text-xl font-black hover:text-red-600"
            >
              ✕
            </button>

            <div className="bg-black p-6 text-center rounded-t-3xl pt-10">
              
              {/* 🚀 NEW: Profile Image inside the Modal */}
              {selectedProfile.profileImage ? (
                <img src={selectedProfile.profileImage} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-800 shadow-lg mx-auto mb-4" />
              ) : (
                <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-black mx-auto mb-4 border-4 border-gray-800 shadow-lg">
                  {selectedProfile.name?.charAt(0).toUpperCase()}
                </div>
              )}

              <h2 className="text-2xl font-black text-white">
                {selectedProfile.name}
              </h2>

              <p className="text-gray-300 text-sm">
                {selectedProfile.email}
              </p>
            </div>

            <div className="p-6 space-y-4">

              <div className="bg-gray-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase">Contact</p>
                <p className="font-bold text-gray-900">
                  {selectedProfile.phone || "Not Provided"}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase">Blood Group</p>
                <p className="font-bold text-red-600">
                  {selectedProfile.bloodGroup || "Unknown"}
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase">Location</p>
                <p className="font-bold text-gray-900">
                  {selectedProfile.city && selectedProfile.state
                    ? `${selectedProfile.city}, ${selectedProfile.state}`
                    : "Not Provided"}
                </p>
              </div>

              <div className="bg-blue-100 p-4 rounded-xl border border-blue-300">
                <p className="text-xs font-bold text-blue-700 uppercase">KYC</p>
                <p className="font-mono font-bold text-gray-900 tracking-widest">
                  {maskAadhar(selectedProfile.aadharNumber)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Bio</p>
                <div className="bg-gray-100 p-4 rounded-xl">
                  <p className="text-gray-900 font-medium">
                    {selectedProfile.bio || "No bio added yet."}
                  </p>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-100 rounded-b-3xl">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-full bg-black text-white py-3 rounded-xl font-bold"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}