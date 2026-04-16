import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

function Navbar() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const check = () => setIsLoggedIn(!!localStorage.getItem("token"))
    window.addEventListener("storage", check)
    return () => window.removeEventListener("storage", check)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setMobileMenuOpen(false)
    navigate("/")
  }

  return (
    <nav className="flex items-center justify-between text-white w-full px-4 md:px-6 py-3">
      {/* Logo */}
      <Link to="/" className="font-black text-lg md:text-xl tracking-tight hover:text-blue-300 transition-colors flex-shrink-0">
        ✈️ AeroBook
      </Link>

      {/* Hamburger Menu Button - Mobile Only */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Links - Desktop */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-semibold">
        {isLoggedIn ? (
          <>
            <Link to="/search" className="text-white/70 hover:text-white transition-colors">Flights</Link>
            <Link to="/my-bookings" className="text-white/70 hover:text-white transition-colors">My Bookings</Link>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 lg:px-4 py-1.5 rounded-xl transition-all text-white/80 hover:text-white text-xs lg:text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
            <Link to="/about" className="text-white/70 hover:text-white transition-colors">About</Link>
            <Link to="/features" className="text-white/70 hover:text-white transition-colors">Features</Link>
            <Link to="/login" className="text-white/70 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-3 lg:px-4 py-1.5 rounded-xl transition-all text-white shadow text-xs lg:text-sm">
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-gradient-to-b from-blue-900/95 to-purple-900/95 backdrop-blur-md border-b border-white/10 md:hidden z-50">
          <div className="flex flex-col gap-3 p-4">
            {isLoggedIn ? (
              <>
                <Link to="/search" className="text-white/70 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Flights</Link>
                <Link to="/my-bookings" className="text-white/70 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>My Bookings</Link>
                <button
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl transition-all text-white/80 hover:text-white text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="text-white/70 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/about" className="text-white/70 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link to="/features" className="text-white/70 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl transition-all text-white shadow text-center w-full" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
