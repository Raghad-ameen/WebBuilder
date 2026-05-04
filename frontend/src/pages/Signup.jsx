import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

 const handleSignup = async (e) => {
  e.preventDefault();
  try {
    const dataToSend = {
      username: formData.email,
      email: formData.email,
      password: formData.password,
      first_name: formData.name
    };
    const res = await axios.post('http://127.0.0.1:8000/api/register/', dataToSend);
    console.log("Success:", res.data);
    navigate('/login');
  } catch (err) {
    console.log("Details of Error 400:", err.response.data);
    alert(JSON.stringify(err.response.data)); 
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 font-sans" dir="ltr">
      <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-950 mb-2">Get started</h2>
          <p className="text-slate-500 font-medium">Create your free account today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder=""
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder=""
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-left">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder=""
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full py-5 bg-slate-950 text-white rounded-2xl font-bold text-lg hover:bg-blue-950 shadow-lg shadow-emerald-100 transition-all active:scale-95">
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium text-sm">
          Already have an account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;