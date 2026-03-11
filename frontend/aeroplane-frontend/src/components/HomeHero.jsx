import { MapPin, Calendar, Search } from "lucide-react"

function Firstpageelement() {
    return (
        <div className="w-full flex flex-col items-end justify-between p-8 text-white h-full">

            {/* Text Section */}
            <div className="text-right max-w-md">
                <h1 className="text-3xl font-bold">
                    your ticket to <br /> explore the world
                </h1>

                <p className="mt-4 mb-7">
                    Discover the world at your fingertips. Our flight booking service opens doors to global destinations.
                </p>
            </div>

            {/* Search Bar */}
            <nav className="bg-white/20 p-4 rounded-2xl backdrop-blur-lg hover:scale-95 transition duration-300">
                <ul className="flex items-center gap-6">

                    <li className="flex items-center">
                        <MapPin size={20}/>
                        <div className="flex flex-col ml-2">
                            <span className="text-xs uppercase opacity-70">from</span>
                            <h6 className="font-semibold">pick the location</h6>
                        </div>
                    </li>

                    <li className="flex items-center">
                        <MapPin size={20}/>
                        <div className="flex flex-col ml-2">
                            <span className="text-xs uppercase opacity-70">to</span>
                            <h6 className="font-semibold">pick the location</h6>
                        </div>
                    </li>

                    <li className="flex items-center">
                        <Calendar size={20}/>
                        <div className="flex flex-col ml-2">
                            <span className="text-xs uppercase opacity-70">departure</span>
                            <h6 className="font-semibold">pick the date</h6>
                        </div>
                    </li>

                    <li className="flex items-center">
                        <Calendar size={20}/>
                        <div className="flex flex-col ml-2">
                            <span className="text-xs uppercase opacity-70">return</span>
                            <h6 className="font-semibold">pick the date</h6>
                        </div>
                    </li>

                    <li>
                        <button className="bg-blue-700 rounded-xl h-12 w-12 flex items-center justify-center hover:bg-blue-800">
                            <Search size={24} color="white"/>
                        </button>
                    </li>

                </ul>
            </nav>

        </div>
    )
}

export default Firstpageelement