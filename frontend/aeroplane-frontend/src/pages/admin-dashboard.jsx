import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import bg from "../assets/frontpage.png"
import api from "../services/api"

function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("flights")
  const [flights, setFlights] = useState([])
  const [airlines, setAirlines] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [flightForm, setFlightForm] = useState({
    flight_number: "",
    route_id: "",
    airline_id: "",
    aircraft_id: "",
    departure_time: "",
    arrival_time: "",
    base_price_economy: "",
  })

  const [airlineForm, setAirlineForm] = useState({
    name: "",
    code: "",
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [flightsRes, airlinesRes, aircraftRes] = await Promise.all([
        api.get("/flights/"),
        api.get("/airlines/"),
        api.get("/aircraft/"),
      ])
      setFlights(flightsRes.data || [])
      setAirlines(airlinesRes.data || [])
      setAircraft(aircraftRes.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFlight = async (e) => {
    e.preventDefault()
    try {
      await api.post("/flights/", flightForm)
      alert("Flight created successfully!")
      setFlightForm({
        flight_number: "",
        route_id: "",
        airline_id: "",
        aircraft_id: "",
        departure_time: "",
        arrival_time: "",
        base_price_economy: "",
      })
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create flight")
    }
  }

  const handleCreateAirline = async (e) => {
    e.preventDefault()
    try {
      await api.post("/airlines/", airlineForm)
      alert("Airline created successfully!")
      setAirlineForm({ name: "", code: "" })
      loadData()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create airline")
    }
  }

  return (
    <div
      className="min-h-screen w-screen bg-cover bg-center flex justify-center items-start p-4 relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      <div className="w-full max-w-6xl mt-4 mb-4 bg-black/20 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 md:p-4 sm:p-8 relative z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white hover:text-blue-300 font-bold flex items-center gap-2 transition-colors">
            <span className="text-2xl">←</span> Back
          </button>
          <h1 className="text-white text-3xl font-black">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {["flights", "airlines", "aircraft"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-bold capitalize transition-all ${
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/40 rounded-2xl p-4 mb-4 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-white text-center py-8 animate-pulse">Loading...</div>
        ) : (
          <>
            {/* Flights Tab */}
            {activeTab === "flights" && (
              <div className="space-y-6">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-black text-xl mb-4">Create New Flight</h2>
                  <form onSubmit={handleCreateFlight} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Flight Number"
                        value={flightForm.flight_number}
                        onChange={(e) => setFlightForm({ ...flightForm, flight_number: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Route ID"
                        value={flightForm.route_id}
                        onChange={(e) => setFlightForm({ ...flightForm, route_id: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Airline ID"
                        value={flightForm.airline_id}
                        onChange={(e) => setFlightForm({ ...flightForm, airline_id: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Aircraft ID"
                        value={flightForm.aircraft_id}
                        onChange={(e) => setFlightForm({ ...flightForm, aircraft_id: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="datetime-local"
                        placeholder="Departure Time"
                        value={flightForm.departure_time}
                        onChange={(e) => setFlightForm({ ...flightForm, departure_time: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="datetime-local"
                        placeholder="Arrival Time"
                        value={flightForm.arrival_time}
                        onChange={(e) => setFlightForm({ ...flightForm, arrival_time: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Base Price Economy"
                        value={flightForm.base_price_economy}
                        onChange={(e) => setFlightForm({ ...flightForm, base_price_economy: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2 rounded-lg transition-all"
                    >
                      Create Flight
                    </button>
                  </form>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-black text-xl mb-4">Existing Flights ({flights.length})</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {flights.map((f) => (
                      <div key={f.id} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm">
                        <p className="font-bold">{f.flight_number}</p>
                        <p className="text-white/50">Departure: {new Date(f.departure_time).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Airlines Tab */}
            {activeTab === "airlines" && (
              <div className="space-y-6">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-black text-xl mb-4">Create New Airline</h2>
                  <form onSubmit={handleCreateAirline} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Airline Name"
                        value={airlineForm.name}
                        onChange={(e) => setAirlineForm({ ...airlineForm, name: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Airline Code (e.g., AA)"
                        value={airlineForm.code}
                        onChange={(e) => setAirlineForm({ ...airlineForm, code: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2 rounded-lg transition-all"
                    >
                      Create Airline
                    </button>
                  </form>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-white font-black text-xl mb-4">Existing Airlines ({airlines.length})</h2>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {airlines.map((a) => (
                      <div key={a.id} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm">
                        <p className="font-bold">{a.name} ({a.code})</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aircraft Tab */}
            {activeTab === "aircraft" && (
              <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                <h2 className="text-white font-black text-xl mb-4">Aircraft Fleet ({aircraft.length})</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {aircraft.map((a) => (
                    <div key={a.id} className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm">
                      <p className="font-bold">{a.model}</p>
                      <p className="text-white/50">Capacity: {a.total_capacity} seats</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
