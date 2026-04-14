import { useState, useEffect, useRef } from "react"
import { MapPin, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function LocationPicker({ label, value, onChange, airports }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = airports.filter(a =>
    !query ||
    a.iata_code?.toLowerCase().includes(query.toLowerCase()) ||
    a.city?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  const selected = airports.find(a => a.iata_code === value)

  return (
    <li ref={ref} className="flex items-center relative">
      <MapPin size={18} className="text-white/70 shrink-0" />
      <div className="flex flex-col ml-2">
        <span className="text-xs uppercase opacity-60 tracking-widest">{label}</span>
        <h6
          className="font-semibold cursor-pointer hover:text-blue-300 transition-colors whitespace-nowrap text-sm"
          onClick={() => { setOpen(o => !o); setQuery("") }}
        >
          {selected ? `${selected.iata_code} — ${selected.city}` : "pick the location"}
        </h6>
      </div>

      {open && (
        <div className="absolute bottom-full left-0 mb-3 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              autoFocus
              type="text"
              placeholder="Search city or IATA..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-white/40 outline-none"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-white/40 text-sm text-center py-4">No airports found</p>
              : filtered.map(a => (
                <button
                  key={a.iata_code}
                  type="button"
                  onClick={() => { onChange(a.iata_code); setOpen(false); setQuery("") }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5"
                >
                  <span className="text-blue-300 font-black text-sm w-10 shrink-0">{a.iata_code}</span>
                  <div>
                    <p className="text-white text-sm font-medium leading-tight">{a.city}</p>
                    <p className="text-white/40 text-xs truncate">{a.name}</p>
                  </div>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </li>
  )
}

function Firstpageelement() {
  const navigate = useNavigate()
  const [airports, setAirports] = useState([])
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    api.get("/airports/").then(res => setAirports(res.data)).catch(() => {})
  }, [])

  const handleSearch = () => {
    if (from && to && date) navigate(`/search?from=${from}&to=${to}&date=${date}`)
    else if (from && to) navigate(`/search?from=${from}&to=${to}`)
    else navigate("/search")
  }

  return (
    <nav className="bg-white/15 border border-white/20 p-4 rounded-2xl backdrop-blur-lg w-fit ml-auto"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}
    >
      <ul className="flex items-center gap-5 text-white">

        <LocationPicker label="from" value={from} onChange={setFrom} airports={airports} />

        {/* Divider */}
        <li className="w-px h-8 bg-white/20 shrink-0" />

        <LocationPicker label="to" value={to} onChange={setTo} airports={airports} />

        <li className="w-px h-8 bg-white/20 shrink-0" />

        <li className="flex items-center">
          <div className="flex flex-col">
            <span className="text-xs uppercase opacity-60 tracking-widest">date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white text-sm outline-none [color-scheme:dark]"
            />
          </div>
        </li>

        <li>
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl h-11 w-11 flex items-center justify-center transition-all shadow-lg shadow-blue-900/50"
          >
            <Search size={20} color="white" />
          </button>
        </li>

      </ul>
    </nav>
  )
}

export default Firstpageelement
