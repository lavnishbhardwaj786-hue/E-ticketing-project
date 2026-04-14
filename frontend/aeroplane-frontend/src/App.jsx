import { Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/register"
import Search from "./pages/search"
import Booking from "./pages/booking"
import MyBookings from "./pages/my-bookings"
import AdminDashboard from "./pages/admin-dashboard"
import About from "./pages/about"
import Features from "./pages/features"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/booking/:flightId" element={<Booking />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
    </Routes>
  )
}

export default App
