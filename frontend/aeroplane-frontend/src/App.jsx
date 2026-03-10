import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Firstpage from './pages/first-page.jsx'
import Layout from './components/layout.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Firstpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/*
        <Route path="/flights" element={<Flights />} />
        <Route path="/flights/:id" element={<FlightDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book/:flightId" element={<Book />} />
        <Route path="/payment/:bookingId" element={<Payment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/ticket/:bookingId" element={<Ticket />} /> */}
      </Routes>
    </div>
  )
}
export default App
