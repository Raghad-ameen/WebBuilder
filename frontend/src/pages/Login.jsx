import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/token/', {
      username: email, 
      password: password
    });
   localStorage.setItem('user', JSON.stringify({
        username: res.data.username,
        is_staff: res.data.is_staff, 
        token: res.data.access
      }));

      localStorage.setItem('access_token', res.data.access);

      if (res.data.is_staff) {
        navigate('/admin'); 
      } else {
        navigate('/dashboard'); 
      }

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "السيرفر لا يستجيب، تأكد من تشغيل Django";
      console.error(errorMessage);
      alert(errorMessage);
    }
  
};

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 font-sans" dir="ltr">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-950 mb-2">Welcome back</h2>
          <p className="text-slate-500 font-medium">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Email Address</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder=""
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder=""
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full py-4 bg-slate-950 text-white rounded-2xl font-bold text-lg hover:bg-blue-950 shadow-xl transition-all active:scale-95">
            Log in
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Don't have an account? <Link to="/register" className="text-emerald-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;