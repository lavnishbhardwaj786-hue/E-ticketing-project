import { useState } from "react";
import Commonelement from "../services/formdata-render";
import Logindata from "../utility/form-data";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
    const [formdata, setformdata] = useState({ name: "", password: "" });
    const navigate = useNavigate();

    function buttonhandle(e) {
        e.preventDefault();
        console.log(formdata);
        navigate('/');
    }

    return (
        <div 
            className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074')` }}
        >
            {/* INTENSE ZOOM CONTAINER */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.3, y: 100, filter: "blur(10px)" }} // Starts tiny, blurred, and low
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}    // Zooms aggressively forward
                transition={{ 
                    duration: 0.8, 
                    type: "spring", // Using spring for a more "fabulous" bounce
                    stiffness: 100,
                    damping: 15
                }}
                className="relative z-20 bg-white/10 backdrop-blur-xl rounded-2xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-white/20"
            >
                <h1 className="text-4xl font-bold text-center text-black mb-2 tracking-tighter">Login</h1>
                <p className="text-black/50 text-center mb-8 text-sm uppercase tracking-widest">Air Link Portal</p>
                
                <form className="flex flex-col space-y-6 items-center" onSubmit={buttonhandle}>
                    <div className="w-full">
                        <Commonelement 
                            data={Logindata} 
                            setformdata={setformdata} 
                            formdata={formdata} 
                        />
                    </div>
                    
                    <Link to={'/register'} className="text-blue-800 hover:text-black transition-colors text-xs underline underline-offset-4">
                        Don't have an account? Register here.
                    </Link>
                    
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        className="w-full bg-white text-blue-600 font-black py-4 px-6 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-lg uppercase tracking-wider"
                    >
                        Submit
                    </motion.button>
                </form>
            </motion.div>

            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
        </div>
    );
}

export default Login;