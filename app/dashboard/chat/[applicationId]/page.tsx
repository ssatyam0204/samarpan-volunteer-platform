"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ChatRoom() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 🚀 NEW: State to hold the attached image
  const [attachment, setAttachment] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return router.push("/login")
    setUser(JSON.parse(storedUser))
    
    fetchMessages()
    // Auto-refresh chat every 3 seconds
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [params.applicationId])

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?applicationId=${params.applicationId}`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent sending if BOTH text and attachment are empty
    if (!newMessage.trim() && !attachment) return

    const messageText = newMessage
    setNewMessage("") // Clear input instantly for better UX
    
    // Save current attachment then clear it for better UX
    const currentAttachment = attachment;
    setAttachment(null) 

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: params.applicationId,
          senderId: user.id,
          senderName: user.name,
          text: messageText,
          attachment: currentAttachment // 🚀 Send the image to the backend!
        })
      })
      fetchMessages() // Instantly fetch the new message
    } catch (error) {
      alert("Failed to send message")
      setAttachment(currentAttachment) // Restore attachment if it failed
    }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center font-black">Loading Secure Chat...</div>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-blue-600 font-bold hover:underline bg-blue-50 px-4 py-2 rounded-xl">
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">Secure Chat Channel</h1>
          <p className="text-xs font-bold text-green-600">End-to-End Encrypted Coordination</p>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 font-bold">No messages yet. Say hello to start coordinating!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs font-bold text-gray-400 mb-1 ml-1">{msg.senderName}</span>
                <div className={`px-5 py-3 rounded-2xl max-w-[80%] shadow-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}>
                  {/* Render Text */}
                  {msg.text && <p className="font-medium">{msg.text}</p>}
                  
                  {/* 🚀 Render the attached image if it exists */}
                  {msg.attachment && (
                    <img 
                      src={msg.attachment} 
                      alt="Attached file" 
                      className={`mt-2 rounded-xl max-w-full md:max-w-[250px] border shadow-sm ${isMe ? 'border-blue-500' : 'border-gray-200'}`}
                    />
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="bg-white p-4 border-t border-gray-200 relative">
        
        {/* 🚀 Image Preview Bubble BEFORE sending */}
        {attachment && (
          <div className="absolute -top-20 left-4 bg-white p-2 rounded-2xl shadow-xl border border-gray-200 flex items-center gap-2">
            <img src={attachment} alt="Preview" className="h-16 w-16 object-cover rounded-xl" />
            <button 
              onClick={() => setAttachment(null)}
              className="bg-red-100 text-red-600 hover:bg-red-200 rounded-full w-6 h-6 flex items-center justify-center font-black text-xs transition"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 items-center">
          
          {/* 🚀 Paperclip Attachment Button */}
          <label className="cursor-pointer p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition text-xl border-2 border-transparent hover:border-gray-300">
            📎
            <input 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) return alert("File too large! Max size is 2MB.");
                  const reader = new FileReader();
                  reader.onloadend = () => setAttachment(reader.result as string);
                  reader.readAsDataURL(file);
                }
                e.target.value = '';
              }} 
            />
          </label>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={attachment ? "Add a message with your photo..." : "Type your message here..."}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 font-bold rounded-2xl px-5 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
          />
          
          <button 
            type="submit" 
            disabled={!newMessage.trim() && !attachment} // Disable if nothing to send
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send ✈️
          </button>
        </form>
      </div>
    </div>
  )
}