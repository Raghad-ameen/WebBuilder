import EditableText from '../components/EditableText.jsx';

import React from 'react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <header className="relative pt-36 pb-32 px-6 text-center overflow-hidden bg-[#0a0026]">
      <div className="absolute top-1/4 left-0 w-125 h-125 bg-indigo-700/30 rounded-full blur-[150px] -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-fuchsia-600/20 rounded-full blur-[120px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        

<h1 className="text-5xl md:text-[88px] font-black leading-[0.6] tracking-tighter mb-8 text-white">   
        Your website, <br/> 
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
            built in minutes.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 mb-14 max-w-2xl mx-auto font-medium opacity-90">
          The ultimate drag-and-drop builder for creators. No code, no stress, just pure results.
        </p>

        <Link 
          to="/login" 
          className="inline-block px-14 py-6 bg-white text-slate-950 rounded-3xl font-bold text-xl hover:bg-indigo-100 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          Start building for free
        </Link>
      </div>
    </header>
  );
};

