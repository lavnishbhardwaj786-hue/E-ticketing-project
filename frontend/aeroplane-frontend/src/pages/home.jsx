import Navbar from "../components/Navbar"
import Firstpageelement from "../components/HomeHero"
import bg from "../assets/frontpage.png"

function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-[1100px] mx-8
                      bg-white/5
                      backdrop-blur-[6px]
                      border border-white/20
                      rounded-3xl
                      p-8
                      flex flex-col">

        <Navbar />

        <div className="flex-1 flex items-center">
          <Firstpageelement />
        </div>

      </div>
    </div>
  )
}

export default Home