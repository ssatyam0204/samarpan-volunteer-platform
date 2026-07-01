"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MyEvents() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ NEW STATES
  const [filter, setFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    fetchEvents(parsedUser.id)
  }, [router])

  const fetchEvents = async (userId: string) => {
    try {
      const response = await fetch("/api/ngo-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        setLoading(false)
        return
      }

      const data = await response.json()
      if (data.success) {
        setEvents(data.events)
      }

    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async (eventId: string) => {
    if (!confirm("Are you sure you want to mark this drive as COMPLETED?")) return

    try {
      const response = await fetch("/api/manage-event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })

      if (response.ok) {
        setEvents(events.map(e =>
          e.id === eventId ? { ...e, status: "COMPLETED" } : e
        ))
      }
    } catch {
      alert("Failed to update status")
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm("🚨 Delete permanently?")) return

    try {
      const response = await fetch("/api/manage-event", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      })

      if (response.ok) {
        setEvents(events.filter(e => e.id !== eventId))
      }
    } catch {
      alert("Failed to delete event")
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center font-black text-gray-900">
        Loading your events...
      </div>
    )
  }

  // ✅ FILTER LOGIC
  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === "ALL" || event.status === filter
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER + FILTER BAR */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <h1 className="text-3xl font-black text-gray-900">
            My Drives
          </h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">

            <input
              type="text"
              placeholder="Search drives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl font-bold focus:border-blue-500 focus:outline-none"
            />

            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  filter === "ALL"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("OPEN")}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  filter === "OPEN"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Active
              </button>

              <button
                onClick={() => setFilter("COMPLETED")}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  filter === "COMPLETED"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                History
              </button>
            </div>

          </div>
        </div>

        {/* EVENTS GRID */}
        {filteredEvents.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 font-bold">
              No drives found for this filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {filteredEvents.map((event) => (

              <div
                key={event.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
              >

                {/* CARD BODY */}
                <div className="p-6 flex-1">

                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                      event.status === "OPEN"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {event.status}
                    </span>

                    <span className="font-black text-green-700 text-lg">
                      ₹{event.amount}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    {event.description}
                  </p>

                  <div className="text-sm font-bold text-gray-700 space-y-1">
                    <div>📍 {event.location}</div>
                    <div>📅 {new Date(event.date).toLocaleDateString('en-IN')}</div>
                    <div>👥 {event.volunteersNeeded} Volunteers</div>
                  </div>

                </div>

                {/* CARD FOOTER ACTIONS */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">

                  {event.status === "COMPLETED" ? (

                    <div className="w-full py-3 bg-green-100 text-green-800 rounded-xl font-black text-center text-sm border border-green-200">
                      ✅ Drive Successfully Completed
                    </div>

                  ) : (

                    <>
                      <button
                        onClick={() => handleMarkCompleted(event.id)}
                        className="flex-1 py-3 bg-green-50 text-green-700 rounded-xl font-black text-sm hover:bg-green-100 transition border border-green-200"
                      >
                        Mark Completed
                      </button>

                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 py-3 bg-red-50 text-red-700 rounded-xl font-black text-sm hover:bg-red-100 transition border border-red-200"
                      >
                        Delete Event
                      </button>
                    </>

                  )}

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </div>
  )
}