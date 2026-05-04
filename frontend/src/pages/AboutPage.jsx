import React from 'react';
import { Link } from 'react-router-dom'
export const AboutPage = () => {
  return (
    <div className="min-h-screen font-sans">
      
      <section className="bg-[#0a0026] pt-32 pb-40 px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12 text-left">
            <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm block mb-4">
              Our Story
            </span>
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter leading-[1.1]">
              Empowering creators to <br/> 
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-fuchsia-400">
                build without limits.
              </span>
            </h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 text-left">
            <p className="text-white/60 text-lg md:text-xl leading-relaxed font-medium">
              Our mission is to bridge the gap between design and development. Whether you're a solo creator 
              or a growing business, we provide the tools to launch your next big thing in minutes, not weeks.
            </p>
          </div>
        </div>
      </section>

<section className="bg-white pt-20 pb-32 px-6">
  <div className="max-w-6xl mx-auto"> 
    
    <div className="rounded-[40px] p-12 md:p-24 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] bg-linear-to-br from-emerald-600 to-teal-600 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
      </div>

      <h2 className="text-white text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight relative z-10">
        Join the creators <br className="hidden md:block" /> building on StructPeak
      </h2>
      
      <Link 
        to="/login" 
        className="mt-10 inline-block bg-white text-emerald-600 px-12 py-5 rounded-2xl font-black text-xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] transition-all hover:-translate-y-1 active:scale-95 relative z-10"
      >
        Start Building Now
      </Link>
      
    </div>
  </div>
</section>

    </div>
  );
};