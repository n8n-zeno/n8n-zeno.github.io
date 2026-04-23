import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/auth/signin', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-[#111] p-8 rounded-2xl border border-[#222] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        {error && <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent border border-[#222] rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#444] transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-[#555] uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent border border-[#222] rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-[#444] focus:outline-none focus:border-[#444] transition-all"
              required
            />
          </div>
          <button type="submit" className="bg-white text-black font-bold py-3 rounded-[10px] mt-4 hover:bg-[#eee] transition-colors">
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-[12px] text-[#888]">
          Don't have an account? <Link to="/signup" className="text-white underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
