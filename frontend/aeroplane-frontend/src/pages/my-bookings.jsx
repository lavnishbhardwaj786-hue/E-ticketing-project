import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import bg from "../assets/frontpage.png"
import { bookingAPI } from "../services/api"

function MyBookings() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancellingId, setCancellingId] = useState(null)

  const fetchBookings = () => {
    setLoading(true)
    bookingAPI.getMyBookings()
      .then(res => setBookings(Array.isArray(res.data) ? res.data : []))
      .catch(e => setError(e.response?.data?.detail || "Failed to load bookings."))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { navigate("/login"); return }
    fetchBookings()
  }, [])

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? You will receive a full refund.")) return
    
    setCancellingId(bookingId)
    try {
      // 1. Get payments for this booking
      const paymentsRes = await bookingAPI.getBookingPayments(bookingId)
      const successfulPayment = paymentsRes.data.find(p => p.status === "success")
      
      if (!successfulPayment) {
        alert("No successful payment found for this booking.")
        return
      }

      // 2. Refund the payment
      await bookingAPI.cancelBooking(successfulPayment.id)
      alert("Booking cancelled and refund processed successfully!")
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel booking.")
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-cover bg-center flex justify-center items-start p-4 relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="w-full max-w-4xl h-full mt-4 mb-4 bg-black/20 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 md:p-8 flex flex-col relative z-10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0">
          <button onClick={() => navigate(-1)} className="text-white hover:text-blue-300 font-bold flex items-center gap-2 transition-colors">
            <span className="text-2xl">←</span> Back
          </button>
          <h1 className="text-white text-2xl font-black">My Bookings</h1>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-white text-lg font-bold animate-pulse">
            Loading your bookings...
          </div>

        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-500/20 border border-red-400/40 rounded-2xl p-6 text-center">
              <p className="text-red-300 font-bold">{error}</p>
              <button onClick={() => navigate("/login")} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-500 transition-all">
                Login Again
              </button>
            </div>
          </div>

        ) : bookings.length === 0 ? (
          // No bookings state
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <p className="text-7xl">🎫</p>
            <p className="text-white text-2xl font-black">No flights booked yet</p>
            <p className="text-white/50 text-sm">Your booked flights will appear here</p>
            <button
              onClick={() => navigate("/search")}
              className="mt-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-500 transition-all active:scale-95"
            >
              Book a Flight
            </button>
          </div>

        ) : (
          // Booked flights list
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
            <p className="text-white/40 text-sm shrink-0 mb-2">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
            {bookings.map((b, i) => (
              <div key={b.id || i} className="bg-black/30 border border-white/10 rounded-2xl p-5 text-white">

                {/* Flight route */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">✈️</span>
                    <div>
                      <p className="font-black text-xl">
                        {b.origin_iata ?? b.flight?.origin_iata ?? "—"} → {b.destination_iata ?? b.flight?.destination_iata ?? "—"}
                      </p>
                      <p className="text-white/50 text-xs">
                        {b.flight_number ?? b.flight?.flight_number ?? "—"} · {b.airline_name ?? b.flight?.airline_name ?? ""}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-black border ${
                      b.status?.toLowerCase() === "confirmed"
                        ? "bg-green-500/20 border-green-400/40 text-green-300"
                        : b.status?.toLowerCase() === "cancelled"
                        ? "bg-red-500/20 border-red-400/40 text-red-300"
                        : "bg-yellow-500/20 border-yellow-400/40 text-yellow-300"
                    }`}>
                      {b.status?.toUpperCase() ?? "PENDING"}
                    </div>
                    {b.status?.toLowerCase() === "confirmed" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="text-xs text-red-400 hover:text-red-300 font-bold underline transition-colors disabled:opacity-50"
                      >
                        {cancellingId === b.id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-white/10 pt-4">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Seat</p>
                    <p className="font-bold">{b.seat_number ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Passenger</p>
                    <p className="font-bold truncate">{b.passenger_name ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Reference</p>
                    <p className="font-bold text-blue-300">{b.booking_reference ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Amount Paid</p>
                    <p className="font-bold">${b.total_amount ?? "—"}</p>
                  </div>
                  {b.departure_time && (
                    <div className="col-span-2">
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Departure</p>
                      <p className="font-bold">
                        {new Date(b.departure_time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                  )}
                  {b.ticket_number && (
                    <div className="col-span-2">
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Ticket</p>
                      <p className="font-bold text-white/70">{b.ticket_number}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Book more CTA */}
        {!loading && !error && bookings.length > 0 && (
          <button
            onClick={() => navigate("/search")}
            className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/30 text-white font-black py-3 rounded-2xl transition-all active:scale-95 text-sm shrink-0"
          >
            + Book Another Flight
          </button>
        )}
      </div>
    </div>
  )
}

export default MyBookings
