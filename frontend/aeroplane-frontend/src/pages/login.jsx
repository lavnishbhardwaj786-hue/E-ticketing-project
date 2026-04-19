import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const [formdata, setformdata] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await authAPI.login(formdata.username, formdata.password);
      localStorage.setItem('token', data.access_token);   // ✅ save FIRST
      window.dispatchEvent(new Event('storage'));
      navigate("/");                                        // ✅ navigate AFTER
    } catch (err) {
      setError('Invalid credentials');
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074')` }}
    >
      <div className="bg-white/20 backdrop-blur-lg p-8 rounded-2xl border border-white/30 w-full max-w-96 mx-4">
        <h2 className="text-3xl font-bold text-white mb-6">Login</h2>
        {error && <p className="text-red-300 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formdata.username}
            onChange={(e) => setformdata({...formdata, username: e.target.value})}
            className="w-full p-3 mb-4 rounded-lg bg-slate-900/60 border border-white/30 text-white placeholder-white/50 focus:border-blue-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={formdata.password}
            onChange={(e) => setformdata({...formdata, password: e.target.value})}
            className="w-full p-3 mb-6 rounded-lg bg-slate-900/60 border border-white/30 text-white placeholder-white/50 focus:border-blue-500 focus:bg-slate-900/80 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
          />
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
            Login
          </button>
        </form>
        <p className="text-white/80 mt-4 text-center">
          Don't have an account? <Link to="/register" className="underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
