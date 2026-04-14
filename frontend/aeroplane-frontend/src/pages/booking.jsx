import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import bg from "../assets/frontpage.png"
import { flightAPI, bookingAPI } from "../services/api"
import { useWebSocket } from "../hooks/useWebSocket"

function Booking() {
  const { flightId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const pricePerSeat = location.state?.price ?? 250

  const [flightData, setFlightData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])  // array now

  const [form, setForm] = useState({
    passenger_name: "",
    passenger_email: "",
    passenger_phone: "",
    passenger_id_number: "",
    passenger_id_type: "passport",
    card_number: "",
    card_expiry: "",
    card_cvv: "",
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successList, setSuccessList] = useState([])  // all booking results
  const { seatUpdates, connected } = useWebSocket(flightId)

  // Refresh seat data when WebSocket updates are received
  useEffect(() => {
    if (seatUpdates.length > 0) {
      const refreshSeats = async () => {
        try {
          const { data } = await flightAPI.getSeats(flightId)
          setFlightData(data)
        } catch (e) {
          console.error('Failed to refresh seat data:', e)
        }
      }
      refreshSeats()
    }
  }, [seatUpdates, flightId])

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await flightAPI.getSeats(flightId)
        setFlightData(data)
      } catch {
        setError("Failed to load flight data.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [flightId])

  const handleInput = e => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleSeat = (seatNumber) => {
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    )
  }

  const totalAmount = (pricePerSeat * selectedSeats.length).toFixed(2)

  const handleBook = async () => {
    if (selectedSeats.length === 0) { setError("Please select at least one seat."); return }
    if (!form.passenger_name || !form.passenger_email || !form.passenger_phone) {
      setError("Please fill in all passenger details."); return
    }
    if (!form.card_number || !form.card_expiry || !form.card_cvv) {
      setError("Please fill in all payment details."); return
    }

    // Get token - check both possible keys
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login", { state: { from: `/booking/${flightId}` } })
      return
    }

    setError("")
    setSubmitting(true)

    const results = []
    const failed = []

    for (const seat of selectedSeats) {
      try {
        const { data } = await bookingAPI.create({
          flight_id: parseInt(flightId),
          seat_number: seat,
          total_amount: parseFloat(pricePerSeat),
          currency: "USD",
          payment_method: "credit_card",
          passenger_name: form.passenger_name,
          passenger_email: form.passenger_email,
          passenger_phone: form.passenger_phone,
          passenger_id_number: form.passenger_id_number,
          passenger_id_type: form.passenger_id_type,
          card_number: form.card_number.replace(/\s/g, ""),
          card_expiry: form.card_expiry,
          card_cvv: form.card_cvv,
        })
        results.push({ seat, ...data })
      } catch (e) {
        failed.push({ seat, reason: e.response?.data?.detail || e.message || "Failed" })
      }
    }

    setSubmitting(false)

    if (results.length > 0) {
      setSuccessList(results)
    }
    if (failed.length > 0) {
      setError(`Failed to book: ${failed.map(f => `${f.seat} (${f.reason})`).join(", ")}`)
    }
  }

  // ── Success screen ──
  if (successList.length > 0) {
    return (
      <div
        className="h-screen w-screen overflow-hidden bg-cover bg-center flex items-center justify-center relative"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />
        <div className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-[40px] p-8 max-w-lg w-full text-white text-center shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-3xl font-black mb-1">
            {successList.length > 1 ? `${successList.length} Seats Booked!` : "Booking Confirmed!"}
          </h2>
          <p className="text-white/50 mb-5 text-sm">Confirmation emails have been sent.</p>

          <div className="space-y-3 mb-6">
            {successList.map((s, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-4 text-left space-y-1.5 border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-blue-300 font-black text-xs uppercase tracking-widest">Seat {s.seat}</span>
                  <span className="text-green-400 text-xs font-bold">{s.payment_status}</span>
                </div>
                <p className="text-sm"><span className="text-white/50">Reference:</span> <span className="font-bold">{s.booking?.booking_reference}</span></p>
                <p className="text-sm"><span className="text-white/50">Ticket:</span> <span className="font-bold">{s.booking?.ticket_number}</span></p>
                <p className="text-sm"><span className="text-white/50">Amount:</span> <span className="font-bold">${pricePerSeat}</span></p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-blue-600/20 border border-blue-400/30 rounded-2xl p-4 mb-6">
            <p className="text-white/60 text-sm">Total Charged</p>
            <p className="text-3xl font-black text-white">${(pricePerSeat * successList.length).toFixed(2)}</p>
            <p className="text-white/40 text-xs">{successList.length} seat{successList.length > 1 ? "s" : ""} × ${pricePerSeat}</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={() => navigate("/search")}
            className="w-full bg-blue-600 hover:bg-blue-500 font-black py-3 rounded-2xl transition-all active:scale-95"
          >
            Back to Flights
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-cover bg-center flex justify-center items-start p-4 relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="w-full max-w-6xl h-full mt-4 mb-4 bg-black/20 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 md:p-8 flex flex-col relative z-10 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-4 mb-5 shrink-0">
          <button onClick={() => navigate(-1)} className="text-white hover:text-blue-300 font-bold flex items-center gap-2 transition-colors">
            <span className="text-2xl">←</span> Back
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-black">Select Your Seats</h1>
            {flightData && (
              <div className="flex items-center gap-3">
                <p className="text-white/50 text-sm">
                  {flightData.flight_number} · {flightData.aircraft_model} · {flightData.booked_seats}/{flightData.total_capacity} booked
                </p>
                {connected && (
                  <div className="flex items-center gap-1 bg-green-500/20 border border-green-400/40 rounded-full px-2 py-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-300 text-xs font-bold">Live</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Selected count badge */}
          {selectedSeats.length > 0 && (
            <div className="bg-blue-600/30 border border-blue-400/50 rounded-2xl px-4 py-2 text-center shrink-0">
              <p className="text-blue-300 font-black text-lg leading-none">{selectedSeats.length}</p>
              <p className="text-white/50 text-xs">seat{selectedSeats.length > 1 ? "s" : ""}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-white text-xl font-bold animate-pulse">
            Loading seat map...
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-5 overflow-hidden">

            {/* ── LEFT: Seat Map ── */}
            <div className="md:w-1/2 flex flex-col overflow-hidden">
              {/* Legend */}
              <div className="flex gap-3 mb-3 shrink-0 flex-wrap">
                {[
                  { color: "bg-white/20 border-white/30", label: "Available" },
                  { color: "bg-blue-600 border-blue-400", label: "Selected" },
                  { color: "bg-white/5 border-white/10 opacity-40", label: "Taken" },
                  { color: "bg-yellow-500/40 border-yellow-500/60", label: "Business" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 rounded border ${l.color}`} />
                    <span className="text-white/60 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <p className="text-white/30 text-xs mb-2 shrink-0">Click multiple seats to select them all.</p>

              {/* Seat grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                {flightData?.seat_map?.rows?.map(row => (
                  <div key={row.row_number} className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-white/30 text-xs w-5 text-right shrink-0">{row.row_number}</span>
                    <div className="flex gap-1.5 flex-1">
                      {row.seats.map((seat, idx) => {
                        const isTaken = !seat.available
                        const isSelected = selectedSeats.includes(seat.number)
                        const isBusiness = row.class === "business"

                        return (
                          <button
                            key={seat.number}
                            disabled={isTaken}
                            onClick={() => toggleSeat(seat.number)}
                            title={seat.number}
                            className={`
                              flex-1 h-8 rounded-lg text-xs font-bold transition-all border
                              ${idx === 3 ? "ml-3" : ""}
                              ${isTaken
                                ? "bg-white/5 border-white/10 text-white/20 cursor-not-allowed"
                                : isSelected
                                  ? "bg-blue-600 border-blue-400 text-white scale-105 shadow-lg shadow-blue-900/50"
                                  : isBusiness
                                    ? "bg-yellow-500/30 border-yellow-500/50 text-yellow-200 hover:bg-yellow-500/50"
                                    : "bg-white/15 border-white/20 text-white hover:bg-white/25"
                              }
                            `}
                          >
                            {seat.number}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Form + Payment ── */}
            <div className="md:w-1/2 flex flex-col overflow-y-auto pr-1 gap-4">

              {/* Selected seats summary */}
              <div className={`shrink-0 rounded-2xl p-3 border transition-all ${selectedSeats.length > 0 ? "bg-blue-600/20 border-blue-400/40" : "bg-white/5 border-white/10"}`}>
                {selectedSeats.length > 0 ? (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-white font-black text-sm">
                        {selectedSeats.join(", ")}
                      </p>
                      <p className="text-white/50 text-xs">{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xl">${totalAmount}</p>
                      <p className="text-white/40 text-xs">${pricePerSeat} × {selectedSeats.length}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/40 text-sm text-center">← Pick seats from the map</p>
                )}
              </div>

              {/* Passenger details */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3">
                <h3 className="text-blue-300 font-black text-xs uppercase tracking-widest">Passenger Details</h3>
                {[
                  { name: "passenger_name", placeholder: "Full Name", type: "text" },
                  { name: "passenger_email", placeholder: "Email Address", type: "email" },
                  { name: "passenger_phone", placeholder: "Phone Number", type: "tel" },
                  { name: "passenger_id_number", placeholder: "ID / Passport Number", type: "text" },
                ].map(f => (
                  <input
                    key={f.name}
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={handleInput}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-400 transition-colors"
                  />
                ))}
                <select
                  name="passenger_id_type"
                  value={form.passenger_id_type}
                  onChange={handleInput}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-400 transition-colors"
                >
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>

              {/* Payment */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3">
                <h3 className="text-blue-300 font-black text-xs uppercase tracking-widest">Payment Details</h3>
                <input
                  type="text"
                  name="card_number"
                  placeholder="Card Number (e.g. 4111 1111 1111 1111)"
                  value={form.card_number}
                  onChange={handleInput}
                  maxLength={19}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-400 transition-colors"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="card_expiry"
                    placeholder="MM/YY"
                    value={form.card_expiry}
                    onChange={handleInput}
                    maxLength={5}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-400 transition-colors"
                  />
                  <input
                    type="text"
                    name="card_cvv"
                    placeholder="CVV"
                    value={form.card_cvv}
                    onChange={handleInput}
                    maxLength={4}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <p className="text-white/25 text-xs">Test card: 4111111111111111 · any future date · any CVV</p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Not logged in warning */}
              {!localStorage.getItem("token") && !localStorage.getItem("access_token") && (
                <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl px-4 py-3 text-yellow-300 text-sm flex items-center justify-between">
                  <span>You need to be logged in to book.</span>
                  <button onClick={() => navigate("/login")} className="underline font-bold ml-2">Login</button>
                </div>
              )}

              {/* Book button */}
              <button
                onClick={handleBook}
                disabled={submitting || selectedSeats.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-lg text-sm uppercase tracking-widest shrink-0"
              >
                {submitting
                  ? `Booking ${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""}...`
                  : selectedSeats.length > 0
                    ? `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? "s" : ""} · $${totalAmount}`
                    : "Select a Seat to Continue"
                }
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Booking
