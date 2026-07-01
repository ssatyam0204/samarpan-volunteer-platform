"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Scanner } from "@yudiel/react-qr-scanner"

export default function QRScannerPage() {
  const params = useParams()
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)

  // 🎵 REAL BEEP SOUND ENGINE (No MP3 file needed!)
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800; // High pitch scanner beep
      
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio not supported on this browser");
    }
  }

  const processQRScan = async () => {
    if (isScanning) return; // Prevent double-scanning
    setIsScanning(true)
    
    playBeep() // 🔊 PLAY THE BEEP!

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      const response = await fetch("/api/scan-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          applicationId: params.id,
          ngoId: storedUser.id 
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert("✅ BEEP! Volunteer Attendance Verified!")
        router.push("/dashboard/ngo/applicants") 
      } else {
        alert(data.message || "Failed to scan QR code.")
        setIsScanning(false) // Let them try again
      }
    } catch (error) {
      alert("Network error while scanning.")
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl p-6 flex flex-col items-center">
        
        <h1 className="text-2xl font-black text-white mb-2">Live Camera Scanner</h1>
        <p className="text-gray-400 font-medium text-sm text-center mb-6">
          Point your physical camera at the Volunteer's QR code.
        </p>

        {/* 📸 REAL HARDWARE CAMERA FEED */}
        <div className="w-full rounded-2xl overflow-hidden border-4 border-gray-700 mb-6 relative bg-gray-800 flex items-center justify-center min-h-[250px]">
          <Scanner 
            onScan={(result) => {
              if (result && result.length > 0) {
                // When the camera reads a QR code successfully, trigger the scan logic!
                processQRScan()
              }
            }}
          />
          {/* Green Laser Overlay */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-green-500 animate-pulse opacity-50 pointer-events-none z-10"></div>
        </div>

        {/* Fallback button just in case the camera doesn't work during your presentation */}
        <button 
          onClick={processQRScan}
          disabled={isScanning}
          className="w-full bg-gray-800 text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-700 disabled:opacity-50 transition"
        >
          {isScanning ? "Processing..." : "Force Manual Scan (Fallback)"}
        </button>
        
        <button 
          onClick={() => router.back()}
          className="w-full bg-transparent text-red-400 py-4 rounded-xl font-bold hover:bg-gray-800 mt-2 transition"
        >
          Cancel & Go Back
        </button>

      </div>
    </div>
  )
}