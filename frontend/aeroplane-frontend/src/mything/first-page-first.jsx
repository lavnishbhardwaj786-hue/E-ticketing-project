import Navbar from "../compnent/navbar";
import frontpage from "../assets/frontpage.png";
import Firstpageelement from "./first-page-element";

function Firstpage() {
    return (
        <div
            className="relative min-h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${frontpage})` }}
            >
            {/* Light Overlay for soft blend */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Center Content */}
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-[85vw] h-[85vh] flex-col 
                 rounded-2xl 
                  bg-white/20 backdrop-blur-0.5g 
                  border border-white/30 
                  shadow-2xl text-white  transition-transform duration-300 
                hover:scale-105 ">
                        <Navbar />
                         <Firstpageelement/>
                    </div>
                </div>

            </div>
        </div>  
    );
}

export default Firstpage;