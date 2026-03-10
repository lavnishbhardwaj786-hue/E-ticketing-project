import { useState } from "react";
import { Registerdata } from "../utility/form-data";
import Commonelement from "../services/formdata-render";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Register() {
  const navigate = useNavigate();
  const [formdata, setformdata] = useState({
    name: "",
    password: ""
  });

  function buttonhandle(e) {
    e.preventDefault();
    console.log(formdata);
    navigate('/login');
  }

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center transition-all duration-700"
      style={{ 
        backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074')` 
      }}
    >
      {/* GLASS CONTAINER WITH ZOOM ANIMATION */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 30 }} // Starts smaller and lower
        animate={{ opacity: 1, scale: 1, y: 0 }}    // Zooms toward the user
        transition={{ 
            duration: 0.6, 
            ease: [0, 0.71, 0.2, 1.01] // Smooth "pop-in" effect
        }}
        className="relative z-20 bg-white/10 backdrop-blur-xl rounded-2xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-white/20"
      >
        <h1 className="text-4xl font-bold text-center text-black mb-2">Register</h1>
        <p className="text-black/50 text-center mb-8 text-sm uppercase tracking-widest">Join Air Link</p>

        <form className="flex flex-col space-y-6 items-center" onSubmit={buttonhandle}>
          <div className="w-full">
            <Commonelement
              data={Registerdata} 
              setformdata={setformdata} 
              formdata={formdata} 
            />
          </div>

          {/* BOUNCY SUBMIT BUTTON */}
          <motion.button 
            whileHover={{ scale: 1.05 }} // Bounces/Grows slightly on hover
            whileTap={{ scale: 0.95 }}   // Shrinks when clicked
            type="submit" 
            className="w-full bg-white text-blue-600 font-black py-4 px-6 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-lg uppercase tracking-wider"
          >
            Create Account
          </motion.button>
          
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="text-black/60 hover:text-black transition-colors text-xs underline underline-offset-4"
          >
            Already have an account? Login
          </button>
        </form>
      </motion.div>

      {/* Decorative background glow */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
    </div>
  );
}

export default Register;