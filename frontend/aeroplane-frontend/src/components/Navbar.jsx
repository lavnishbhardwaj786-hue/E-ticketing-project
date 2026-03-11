import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

function Navbar() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"))

    const updateAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("token"))
    }

    window.addEventListener("storage", updateAuth)

    return () => window.removeEventListener("storage", updateAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/login")
  }

  return (
    <nav className="flex justify-between items-center px-8 py-4 text-white">

      <Link to="/" className="text-lg font-bold">
        ✈️ Air Link
      </Link>

      <ul className="flex gap-6">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/offer">Offer</Link></li>
        <li><Link to="/seat">Seat</Link></li>
        <li><Link to="/destination">Destination</Link></li>
      </ul>

      {isLoggedIn ? (
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-white text-blue-600 rounded-full"
        >
          Logout
        </button>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-white text-blue-600 rounded-full"
        >
          Login
        </button>
      )}

    </nav>
  )
}

export default Navbar