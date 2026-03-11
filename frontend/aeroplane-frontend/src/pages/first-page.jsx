import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from 'react';

function Firstpage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <nav className="flex justify-between items-center px-8 py-4 text-white">
            <div>
                <Link to="/" className="px-6 py-2 hover:text-black transition duration-300">✈️ Air link</Link>
            </div>
            <ul className="flex gap-0.2">
                <li className="px-6 py-2 hover:text-black transition duration-300"><Link to={'/'}>home</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300"><Link to={'/about'}>about</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300"><Link to={'/offer'}>offer</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300"><Link to={'/seat'}>seat</Link></li>
                <li className="px-6 py-2 hover:text-black transition duration-300"><Link to={'/destination'}>destination</Link></li>
            </ul>
            <div>
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="px-6 py-2 text-blue-500 bg-white border-2 border-blue-500 rounded-full font-semibold hover:bg-blue-500 hover:text-white transition duration-300">
                        Logout
                    </button>
                ) : (
                    <Link to="/register">
                        <button className="px-6 py-2 text-blue-500 bg-white border-2 border-blue-500 rounded-full font-semibold hover:bg-blue-500 hover:text-white transition duration-300">
                            {
                                (!isLoggedIn )? "Sign Up":"logged in"
                            }
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Firstpage