import { useNavigate } from "react-router-dom"
import bg from "../assets/frontpage.png"

const features = [
  { icon: "🗺️", title: "Smart Route Search", desc: "Search routes with real-time availability filtered by origin, destination, and date." },
  { icon: "💺", title: "Interactive Seat Map", desc: "Pick your exact seat from a live map showing available, taken, and business class seats." },
  { icon: "🎫", title: "Multi-Seat Booking", desc: "Book multiple seats in one go — perfect for groups and families." },
  { icon: "⚡", title: "Instant Confirmation", desc: "Get your booking reference and ticket number the moment payment goes through." },
  { icon: "🔐", title: "Secure Payments", desc: "All payments processed securely. Card details never stored on our servers." },
  { icon: "📋", title: "My Bookings", desc: "View all your past and upcoming bookings, references, and passenger details in one place." },
]

function Features() {
  const navigate = useNavigate()
  return (
    <div
      className="min-h-screen w-screen overflow-hidden bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full w-full max-w-3xl mx-4 mx-4 bg-black/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-white flex flex-col max-h-[90vh] overflow-y-auto">

        <button onClick={() => navigate(-1)} className="text-white/50 hover:text-white mb-5 flex items-center gap-2 transition-colors text-sm self-start">
          ← Back
        </button>

        <div className="text-center mb-6">
          <p className="text-4xl mb-3">🚀</p>
          <h1 className="text-3xl font-black mb-1">Features</h1>
          <p className="text-white/50 text-sm">Everything you need to book your perfect flight</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {features.map(f => (
            <div key={f.title} className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 transition-all">
              <p className="text-2xl mb-2">{f.icon}</p>
              <h3 className="font-black   text-sm mb-1">{f.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/register")}
            className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl font-black transition-all active:scale-95 text-sm"
          >
            Sign Up Free
          </button>
          <button
            onClick={() => navigate("/search")}
            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-2xl font-black transition-all active:scale-95 text-sm"
          >
            Browse Flights
          </button>
        </div>
      </div>
    </div>
  )
}

export default Features
