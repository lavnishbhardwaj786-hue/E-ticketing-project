import { Link } from "react-router-dom"
import { MapPin, Calendar, Search } from 'lucide-react';
function Firstpageelement() {
    return (
        <div className="flex-1 flex flex-col justify-between p-8"> 
            <div>
                <h1 className="text-3xl text-right font-bold">your ticket to <br/>explore the world</h1>
                <p className="text-right mt-4 ml-auto max-w-md mb-7"> 
                    Discover the world at your fingertips. Our flight booking service opens doors to global destinations, making travel dreams a reality with convenience and ease.
                </p>
            </div>

            
            <nav className="bg-white/10 p-4 rounded-2xl backdrop-blur-2g">
                <ul className="flex items-center justify-between gap-4">
                    <li className="flex flex-row">
                        <div>
                        <MapPin className="text-gray-800" size={20} />
                        </div>
                        <div lassName="flex flex-col"> 
                        <span className="text-xs uppercase opacity-70">from</span>
                        <h6 className="font-semibold">pick the location</h6>
                        </div>
                    </li>
                    <li className="flex flex-row">
                        <div>
                        <MapPin className="text-gray-800" size={20} />
                        </div>
                        <div lassName="flex flex-col"> 
                        <span className="text-xs uppercase opacity-70">to</span>
                        <h6 className="font-semibold">pick the location</h6>
                        </div>
                    </li>
                    <li className="flex flex-row">
                        <div>
                        <Calendar className="text-gray-800" size={20} />
                        </div>
                        <div lassName="flex flex-col"> 
                        <span className="text-xs uppercase opacity-70">departure</span>
                        <h6 className="font-semibold">pick the date</h6>
                        </div>
                    </li>
                    <li className="flex flex-row">
                        <div>
                        <Calendar className="text-gray-800" size={20} />
                        </div>
                        <div lassName="flex flex-col"> 
                        <span className="text-xs uppercase opacity-70">return</span>
                        <h6 className="font-semibold">pick the date</h6>
                        </div>
                    </li>
                    
                    <li>
                        <button className="bg-blue-700 rounded-xl h-12 w-12 flex items-center justify-center hover:bg-blue-800 transition-colors">
                            <Search color="#FFFFFF" size={24} />
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
export default Firstpageelement