import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import bg from "../assets/frontpage.png"

function Search() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [allFlights, setAllFlights] = useState([])
  const [airports, setAirports] = useState([])
  const [loading, setLoading] = useState(true)

  // Pre-fill from URL params if navigated from HomeHero
  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")
  const [date, setDate] = useState(searchParams.get("date") || "")

  const [fromOpen, setFromOpen] = useState(false)
  const [toOpen, setToOpen] = useState(false)

  // what's actually shown — starts as all, updated on search click
  const [displayed, setDisplayed] = useState([])

  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
    const init = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]

        const apRes = await fetch(`${BASE}/api/v1/airports/`)
        const aps = await apRes.json()
        setAirports(Array.isArray(aps) ? aps : [])

        const routesRes = await fetch(`${BASE}/api/v1/routes/`)
        const routes = await routesRes.json()

        const flightPromises = routes.map(r => {
          const origin = aps.find(a => a.id === r.source_airport_id)
          const dest   = aps.find(a => a.id === r.destination_airport_id)
          if (!origin || !dest) return Promise.resolve([])
          return fetch(
            `${BASE}/api/v1/flights/search?origin_iata=${origin.iata_code}&destination_iata=${dest.iata_code}&date=${today}`
          ).then(r => r.json()).then(d => Array.isArray(d) ? d : []).catch(() => [])
        })

        const results = await Promise.all(flightPromises)
        const unique = Array.from(
          new Map(results.flat().map(f => [f.id, f])).values()
        )
        setAllFlights(unique)

        // If coming from HomeHero with pre-filled params, auto-filter immediately
        const urlFrom = searchParams.get("from")
        const urlTo   = searchParams.get("to")
        const urlDate = searchParams.get("date")
        if (urlFrom || urlTo || urlDate) {
          const preFiltered = unique.filter(f => {
            const matchFrom = !urlFrom || f.origin_iata === urlFrom
            const matchTo   = !urlTo   || f.destination_iata === urlTo
            const matchDate = !urlDate || f.departure_time?.startsWith(urlDate)
            return matchFrom && matchTo && matchDate
          })
          setDisplayed(preFiltered)
        } else {
          setDisplayed(unique)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Dropdown options from loaded flights
  const fromOptions = [...new Set(allFlights.map(f => f.origin_iata))].map(iata => ({
    iata,
    city: airports.find(a => a.iata_code === iata)?.city || iata
  }))

  const toOptions = [...new Set(allFlights.map(f => f.destination_iata))].map(iata => ({
    iata,
    city: airports.find(a => a.iata_code === iata)?.city || iata
  }))

  // Search button — filter and update displayed
  const handleSearch = () => {
    const result = allFlights.filter(f => {
      const matchFrom = !from || f.origin_iata === from
      const matchTo   = !to   || f.destination_iata === to
      const matchDate = !date  || f.departure_time.startsWith(date)
      return matchFrom && matchTo && matchDate
    })
    setDisplayed(result)
  }

  const handleClear = () => {
    setFrom("")
    setTo("")
    setDate("")
    setDisplayed(allFlights)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => { setFromOpen(false); setToOpen(false) }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-cover bg-center flex justify-center items-start p-4 relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Main card — full height minus padding */}
      <div className="w-full max-w-6xl h-full bg-black/20 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl p-6 md:p-8 flex flex-col relative z-10 overflow-hidden mt-4 mb-4">

        {/* ── Top bar ── */}
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6 shrink-0">

          <button
            onClick={() => navigate("/")}
            className="text-white hover:text-blue-300 flex items-center gap-2 font-bold transition-colors shrink-0"
          >
            <span className="text-2xl">←</span> Home
          </button>

          {/* Filter bar */}
          <div className="flex-1 w-full bg-black/40 border border-white/20 rounded-3xl p-2 flex flex-wrap md:flex-nowrap items-center gap-2">

            {/* FROM */}
            <div
              className="flex-1 min-w-[130px] px-3 py-2 border-r border-white/10 relative"
              onClick={e => e.stopPropagation()}
            >
              <label className="text-[10px] uppercase text-blue-300 font-black tracking-widest block">From</label>
              <button
                onClick={() => { setFromOpen(o => !o); setToOpen(false) }}
                className="w-full text-left text-white font-semibold text-sm outline-none truncate"
              >
                {from
                  ? `${fromOptions.find(o => o.iata === from)?.city} (${from})`
                  : <span className="text-white/40">Any origin</span>
                }
              </button>
              {fromOpen && fromOptions.length > 0 && (
                <div className="absolute top-full left-0 w-56 bg-slate-900 border border-white/20 z-50 rounded-2xl mt-2 shadow-2xl overflow-y-auto max-h-48">
                  <div
                    onClick={() => { setFrom(""); setFromOpen(false) }}
                    className="p-3 hover:bg-blue-600 cursor-pointer text-white/50 text-sm border-b border-white/10 transition-colors"
                  >
                    All origins
                  </div>
                  {fromOptions.map(o => (
                    <div
                      key={o.iata}
                      onClick={() => { setFrom(o.iata); setFromOpen(false) }}
                      className="p-3 hover:bg-blue-600 cursor-pointer text-white border-b border-white/5 transition-colors"
                    >
                      <p className="font-bold text-sm">{o.city}</p>
                      <p className="text-xs opacity-60">{o.iata}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TO */}
            <div
              className="flex-1 min-w-[130px] px-3 py-2 border-r border-white/10 relative"
              onClick={e => e.stopPropagation()}
            >
              <label className="text-[10px] uppercase text-blue-300 font-black tracking-widest block">To</label>
              <button
                onClick={() => { setToOpen(o => !o); setFromOpen(false) }}
                className="w-full text-left text-white font-semibold text-sm outline-none truncate"
              >
                {to
                  ? `${toOptions.find(o => o.iata === to)?.city} (${to})`
                  : <span className="text-white/40">Any destination</span>
                }
              </button>
              {toOpen && toOptions.length > 0 && (
                <div className="absolute top-full left-0 w-56 bg-slate-900 border border-white/20 z-50 rounded-2xl mt-2 shadow-2xl overflow-y-auto max-h-48">
                  <div
                    onClick={() => { setTo(""); setToOpen(false) }}
                    className="p-3 hover:bg-blue-600 cursor-pointer text-white/50 text-sm border-b border-white/10 transition-colors"
                  >
                    All destinations
                  </div>
                  {toOptions.map(o => (
                    <div
                      key={o.iata}
                      onClick={() => { setTo(o.iata); setToOpen(false) }}
                      className="p-3 hover:bg-blue-600 cursor-pointer text-white border-b border-white/5 transition-colors"
                    >
                      <p className="font-bold text-sm">{o.city}</p>
                      <p className="text-xs opacity-60">{o.iata}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DATE */}
            <div className="flex-1 min-w-[130px] px-3 py-2 border-r border-white/10">
              <label className="text-[10px] uppercase text-blue-300 font-black tracking-widest block">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="bg-transparent text-white w-full outline-none font-semibold text-sm [color-scheme:dark]"
              />
            </div>

            {/* SEARCH button */}
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 px-5 py-3 rounded-2xl text-white font-black text-sm shadow-lg transition-all shrink-0"
            >
              🔍 Search
            </button>

            {/* CLEAR */}
            {(from || to || date) && (
              <button
                onClick={handleClear}
                className="text-white/50 hover:text-red-400 text-sm px-3 transition-colors shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Results header ── */}
        <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-3 shrink-0">
          <h2 className="text-white text-2xl font-black tracking-tight">
            {from || to ? "Filtered Flights" : "All Flights Today"}
          </h2>
          <span className="text-blue-300 font-mono font-bold bg-blue-900/30 px-3 py-1 rounded-lg text-sm">
            {loading ? "loading..." : `${displayed.length} flight${displayed.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* ── Flight cards — this is the ONLY scrollable area ── */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
          {loading ? (
            <div className="text-white text-center py-20 animate-pulse text-xl font-bold">
              Scanning Airspace...
            </div>
          ) : displayed.length > 0 ? (
            displayed.map(f => (
              <div
                key={f.id}
                className="bg-black/40 hover:bg-black/60 border border-white/10 rounded-3xl p-4 text-white grid grid-cols-1 md:grid-cols-5 gap-3 items-center transition-all shadow-xl"
              >
                {/* Airline */}
                <div className="md:col-span-1">
                  <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">{f.airline_name}</p>
                  <p className="text-base font-bold">{f.flight_number}</p>
                  <p className="text-xs text-white/40">{f.aircraft_model}</p>
                </div>

                {/* Route */}
                <div className="md:col-span-2 flex items-center justify-between px-2">
                  <div className="text-center">
                    <p className="text-xl font-black">
                      {new Date(f.departure_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs font-bold text-white/70">{f.origin_iata}</p>
                    <p className="text-xs text-white/40">{f.origin_city}</p>
                  </div>
                  <div className="flex-1 mx-3 relative">
                    <div className="border-t-2 border-dashed border-white/20" />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">✈️</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black">
                      {new Date(f.arrival_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs font-bold text-white/70">{f.destination_iata}</p>
                    <p className="text-xs text-white/40">{f.destination_city}</p>
                  </div>
                </div>

                {/* Price + seats */}
                <div className="text-center">
                  <p className="text-2xl font-black">${f.base_price_economy}</p>
                  <p className={`text-xs font-bold mt-1 ${f.available_seats < 10 ? "text-red-400" : "text-green-400"}`}>
                    {f.available_seats} seats left
                  </p>
                </div>

                {/* Book */}
                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/booking/${f.id}`, { state: { price: f.base_price_economy } })}
                    className="w-full md:w-auto bg-blue-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-blue-500 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/20">
              <p className="text-5xl mb-4">✈️</p>
              <p className="text-white font-bold text-xl">No flights match your filters.</p>
              <p className="text-white/50 mt-2 text-sm">Clear filters to see all available flights.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Search
