import { useNavigate } from "react-router-dom"
import bg from "../assets/frontpage.png"

function About() {
  const navigate = useNavigate()
  return (
    <div
      className="min-h-screen w-screen overflow-hidden bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 w-full max-w-2xl mx-4 bg-black/30 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 text-white flex flex-col max-h-[90vh] overflow-y-auto">

        <button onClick={() => navigate(-1)} className="text-white/50 hover:text-white mb-5 flex items-center gap-2 transition-colors text-sm self-start">
          ← Back
        </button>

        <div className="text-center mb-7">
          <p className="text-4xl mb-3">✈️</p>
          <h1 className="text-3xl font-black mb-1">About AeroBook</h1>
          <p className="text-white/50 text-sm">Your trusted flight booking platform</p>
        </div>

        <div className="space-y-4 text-white/75 text-sm leading-relaxed mb-7">
          <p>AeroBook is a modern flight booking platform built to make air travel simple, fast, and accessible. We connect travellers to hundreds of routes worldwide with real-time seat availability and instant booking confirmation.</p>
          <p>Whether you're booking a single seat or multiple seats for your group, AeroBook handles it seamlessly — from search to seat selection to payment, all in one place.</p>
          <p>Our platform is built with a focus on transparency: no hidden fees, clear pricing, and instant ticket generation with a unique booking reference for every reservation.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { stat: "500+", label: "Routes" },
            { stat: "1M+", label: "Tickets Booked" },
            { stat: "99.9%", label: "Uptime" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
              <p className="text-2xl font-black text-blue-300">{s.stat}</p>
              <p className="text-white/50 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/register")}
          className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl font-black transition-all active:scale-95 text-sm"
        >
          Get Started Free
        </button>
      </div>
    </div>
  )
}

export default About
