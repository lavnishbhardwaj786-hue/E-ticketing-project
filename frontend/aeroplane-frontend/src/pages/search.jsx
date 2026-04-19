import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import bg from "../assets/frontpage.png";
import { flightAPI } from "../services/api";

const API_ROOT =
  import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [airports, setAirports] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const apRes = await fetch(`${API_ROOT}/api/v1/airports/`);
        const aps = await apRes.json();
        setAirports(Array.isArray(aps) ? aps : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load airports right now.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (from && to && date && airports.length > 0) {
      handleSearch();
    }
  }, [airports.length]);

  useEffect(() => {
    const close = () => {
      setFromOpen(false);
      setToOpen(false);
    };

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const airportOptions = useMemo(
    () =>
      airports
        .map((airport) => ({
          iata: airport.iata_code,
          city: airport.city,
          country: airport.country,
        }))
        .sort((a, b) => a.city.localeCompare(b.city)),
    [airports]
  );

  const handleSearch = async () => {
    if (!from || !to || !date) {
      setError("Choose origin, destination, and date to search flights.");
      setDisplayed([]);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setError("");
    setHasSearched(true);

    try {
      const { data } = await flightAPI.search({
        origin_iata: from,
        destination_iata: to,
        date,
      });

      setDisplayed(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDisplayed([]);
      setError(
        err.response?.data?.detail ||
          "Unable to load flights right now. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setFrom("");
    setTo("");
    setDate("");
    setDisplayed([]);
    setError("");
    setHasSearched(false);
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden bg-cover bg-center flex justify-center items-start p-4 relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div className="w-full max-w-6xl max-h-[calc(100vh-32px)] bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl md:rounded-[40px] shadow-2xl p-3 sm:p-6 md:p-8 flex flex-col relative z-10 overflow-hidden my-4">
        <div className="flex flex-col gap-2 sm:gap-4 items-start sm:items-center mb-4 sm:mb-6 shrink-0">
          <button
            onClick={() => navigate("/")}
            className="text-white hover:text-blue-300 flex items-center gap-2 font-bold transition-colors shrink-0 text-sm md:text-base"
          >
            <span className="text-xl md:text-2xl">&larr;</span> <span className="hidden sm:inline">Home</span>
          </button>

          <div className="flex-1 w-full bg-black/40 border border-white/20 rounded-2xl md:rounded-3xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div
              className="flex-1 min-w-full sm:min-w-[130px] px-3 py-2 sm:border-r border-white/10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <label className="text-[10px] uppercase text-blue-300 font-black tracking-widest block">
                From
              </label>
              <button
                onClick={() => {
                  setFromOpen((open) => !open);
                  setToOpen(false);
                }}
                className="w-full text-left text-white font-semibold text-xs sm:text-sm outline-none truncate bg-slate-900/40 px-2 py-1 rounded hover:bg-slate-900/60 transition-colors"
              >
                {from ? (
                  `${airportOptions.find((option) => option.iata === from)?.city} (${from})`
                ) : (
                  <span className="text-white/40">Choose origin</span>
                )}
              </button>
              {fromOpen && airportOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 sm:w-56 bg-slate-900 border border-white/20 z-50 rounded-2xl mt-2 shadow-2xl overflow-y-auto max-h-48">
                  {airportOptions.map((option) => (
                    <div
                      key={option.iata}
                      onClick={() => {
                        setFrom(option.iata);
                        setFromOpen(false);
                      }}
                      className="p-3 hover:bg-blue-600 cursor-pointer text-white border-b border-white/5 transition-colors"
                    >
                      <p className="font-bold text-sm">{option.city}</p>
                      <p className="text-xs opacity-60">
                        {option.iata} | {option.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="flex-1 min-w-full sm:min-w-[130px] px-3 py-2 sm:border-r border-white/10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <label className="text-[10px] uppercase text-blue-300 font-black tracking-widest block">
                To
              </label>
              <button
                onClick={() => {
                  setToOpen((open) => !open);
                  setFromOpen(false);
                }}
                className="w-full text-left text-white font-semibold text-xs sm:text-sm outline-none truncate bg-slate-900/40 px-2 py-1 rounded hover:bg-slate-900/60 transition-colors"
              >
                {to ? (
                  `${airportOptions.find((option) => option.iata === to)?.city} (${to})`
                ) : (
                  <span className="text-white/40">Choose destination</span>
                )}
              </button>
              {toOpen && airportOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 sm:w-56 bg-slate-900 border border-white/20 z-50 rounded-2xl mt-2 shadow-2xl overflow-y-auto max-h-48">
                  {airportOptions.map((option) => (
                    <div
                      key={option.iata}
                      onClick={() => {
                        setTo(option.iata);
                        setToOpen(false);
                      }}
                      className="p-3 hover:bg-blue-600 cursor-pointer text-white border-b border-white/5 transition-colors"
                    >
                      <p className="font-bold text-sm">{option.city}</p>
                      <p className="text-xs opacity-60">
                        {option.iata} | {option.country}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-full sm:min-w-[130px] px-3 py-2 sm:border-r border-white/10">
              <label className="text-[10px] uppercase text-blue-300 font-black tracking-widest block">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-900/60 text-white w-full outline-none font-semibold text-xs sm:text-sm [color-scheme:dark] border border-white/20 rounded px-2 py-1 focus:border-blue-500 focus:bg-slate-900/80 transition-all"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleSearch}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 active:scale-95 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg transition-all shrink-0"
              >
                Search
              </button>

              {(from || to || date) && (
                <button
                  onClick={handleClear}
                  className="text-white/50 hover:text-red-400 text-xs sm:text-sm px-2 sm:px-3 transition-colors shrink-0"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-white/20 pb-3 shrink-0">
          <h2 className="text-white text-lg sm:text-2xl font-black tracking-tight">
            Available Flights
          </h2>
          <span className="text-blue-300 font-mono font-bold bg-blue-900/30 px-3 py-1 rounded-lg text-xs sm:text-sm">
            {loading || searching
              ? "loading..."
              : `${displayed.length} flight${displayed.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
          {loading ? (
            <div className="text-white text-center py-20 animate-pulse text-xl font-bold">
              Loading airports...
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/20">
              <p className="text-white font-bold text-xl">{error}</p>
            </div>
          ) : displayed.length > 0 ? (
            displayed.map((flight) => (
              <div
                key={flight.id}
                className="bg-black/40 hover:bg-black/60 border border-white/10 rounded-3xl p-4 text-white grid grid-cols-1 md:grid-cols-5 gap-3 items-center transition-all shadow-xl"
              >
                <div className="md:col-span-1">
                  <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-1">
                    {flight.airline_name}
                  </p>
                  <p className="text-base font-bold">{flight.flight_number}</p>
                  <p className="text-xs text-white/40">{flight.aircraft_model}</p>
                </div>

                <div className="md:col-span-2 flex items-center justify-between px-2">
                  <div className="text-center">
                    <p className="text-xl font-black">
                      {new Date(flight.departure_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs font-bold text-white/70">{flight.origin_iata}</p>
                    <p className="text-xs text-white/40">{flight.origin_city}</p>
                  </div>
                  <div className="flex-1 mx-3 relative">
                    <div className="border-t-2 border-dashed border-white/20" />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base">
                      Flight
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black">
                      {new Date(flight.arrival_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs font-bold text-white/70">
                      {flight.destination_iata}
                    </p>
                    <p className="text-xs text-white/40">{flight.destination_city}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-2xl font-black">${flight.base_price_economy}</p>
                  <p
                    className={`text-xs font-bold mt-1 ${
                      flight.available_seats < 10 ? "text-red-400" : "text-green-400"
                    }`}
                  >
                    {flight.available_seats} seats left
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => navigate(`/booking/${flight.id}`)}
                    className="w-full md:w-auto bg-blue-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-blue-500 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))
          ) : hasSearched ? (
            <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/20">
              <p className="text-white font-bold text-xl">
                No flights found for {from} to {to} on {date}.
              </p>
              <p className="text-white/50 mt-2 text-sm">
                Try another date or a different route.
              </p>
            </div>
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-3xl border border-dashed border-white/20">
              <p className="text-white font-bold text-xl">
                Choose origin, destination, and date to load flights.
              </p>
              <p className="text-white/50 mt-2 text-sm">
                Airports are loaded, but flights are fetched only when you search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
