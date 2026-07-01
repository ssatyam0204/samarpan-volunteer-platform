"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function CertificatePage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch("/api/certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: params.id })
        })
        const result = await response.json()
        if (result.success) {
          setData(result.application)
        }
      } catch (error) {
        console.error("Failed to load certificate")
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) fetchCertificate()
  }, [params.id])

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-xl">Generating Certificate...</div>
  if (!data) return <div className="min-h-screen flex items-center justify-center font-black text-xl text-red-600">Certificate not found.</div>

  const printDocument = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-200 py-10 flex flex-col items-center print:bg-white print:py-0">
      
      {/* Web-only controls */}
      <div className="mb-6 flex gap-4 print:hidden">
        <button onClick={() => router.back()} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black">
          ← Back
        </button>
        <button onClick={printDocument} className="bg-blue-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 shadow-lg flex items-center gap-2">
          🖨️ Save as PDF
        </button>
      </div>

      {/* The Actual Certificate Canvas */}
      <div className="bg-white w-[1000px] h-[700px] p-12 shadow-2xl relative border-[16px] border-double border-gray-800 flex flex-col items-center justify-center text-center print:w-[100%] print:h-screen print:border-[12px] print:shadow-none">
        
        {/* Background Watermark */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
          <span className="text-[150px] font-black uppercase tracking-tighter transform -rotate-45">SAMARPAN</span>
        </div>

        <div className="relative z-10 w-full">
          <h3 className="text-xl font-black text-gray-500 tracking-widest uppercase mb-4">Certificate of Appreciation</h3>
          <h1 className="text-6xl font-black text-gray-900 mb-8 font-serif">PROUDLY PRESENTED TO</h1>
          
          <div className="border-b-4 border-gray-900 pb-2 mb-6 w-3/4 mx-auto">
            <h2 className="text-5xl font-black text-blue-800 uppercase tracking-wide">
              {data.volunteer.name}
            </h2>
          </div>

          <p className="text-xl font-medium text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            For outstanding dedication and exceptional service as a volunteer during the <strong className="text-gray-900">{data.requirement.title}</strong> drive. Your contribution has made a lasting impact.
          </p>

          <div className="flex justify-between items-end px-20 mt-16">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 mb-2">{new Date(data.requirement.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <div className="w-48 h-px bg-gray-400 mb-2"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Date of Event</span>
            </div>

            {/* Gold Seal */}
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white ring-4 ring-yellow-500">
              <span className="text-white font-black text-center leading-tight">OFFICIAL<br/>SEAL</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-gray-900 mb-2 uppercase">{data.requirement.creator.name}</span>
              <div className="w-48 h-px bg-gray-400 mb-2"></div>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Verified NGO</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}