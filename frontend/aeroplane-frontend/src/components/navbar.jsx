import { Link, useNavigate } from "react-router-dom"



function Navbar() {
    const navigate=useNavigate();
    return (
        <nav className="flex justify-between items-center px-8 py-4 text-white ">
            <div>
                <Link to="/" className="px-6 py-2 ">  ✈️ Air link</Link>
            </div>
            <ul className="flex  gap-3">
                <li className="px-6 py-2 hover:text-black transition duration-300  bg-white/30 backdrop-blur-1g  rounded-full hover:scale-95 "> <Link to={'/'} >home</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300  bg-white/30 backdrop-blur-1g  rounded-full hover:scale-95" > <Link to={'/about'}>about</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300  bg-white/30 backdrop-blur-1g  rounded-full hover:scale-95"> <Link to={'/offer'}>offer</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300  bg-white/30 backdrop-blur-1g rounded-full hover:scale-95 "> <Link to={'/seat'}>seat</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300  bg-white/30 backdrop-blur-1g  rounded-full hover:scale-95"> <Link to={'/destination'}>destination</Link></li>
            </ul>
            <div>
                <button onClick={()=>{ navigate('/login') }} className="px-6 py-2 text-blue-500 bg-white border-2 border-blue-500 
                     rounded-full font-semibold
                     hover:bg-blue-500 hover:text-white 
                     transition duration-300 hover:scale-95">
                    Sign Up
                </button>
            </div>
        </nav>
    )
}

export default Navbar