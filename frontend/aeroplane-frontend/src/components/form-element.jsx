
function Formmade({contenttype, name, id, value, onChange, placeholder}) {
    return(
        <div className="flex flex-row items-center mb-4 w-full"> 
            <label 
                htmlFor={id} 
                className="block text-sm font-medium text-black w-24 text-left"
            >
                {name}
            </label>
            <input 
                type={contenttype} 
                id={id} 
                name={name} 
                placeholder={placeholder || "Enter " + name}
                value={value} 
                onChange={onChange}
                className="bg-white/50 backdrop-blur-lg rounded-lg p-2 flex-1 text-left border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-black/50"
            />
        </div>
    )
}
export default Formmade;   