import React from 'react';
import NewStatusImage from '../assets/model.png';
import { Link } from 'react-router-dom';

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6 md:px-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        <div className="space-y-8">
          <div className="space-y-4">
           
            <h2 className="text-5xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter">
      Design it fast, <br/> 
      <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-fuchsia-400">
        make it yours
      </span>
    </h2>
          </div>
          
          <p className="text-lg text-slate-500 font-medium max-w-sm leading-snug">
    Start with a blank canvas, end with a masterpiece. 
 Your drag-and-drop journey to a professional website starts here  </p>

         <Link 
  to="/login" 
  className="inline-block px-10 py-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-blue-950 transition-all shadow-xl active:scale-95 text-center"
>
  Start Building
</Link>
        </div>

        <div className="relative flex justify-center items-center">
          
          <div className="relative z-0 transform translate-x-4 translate-y-4 opacity-0 grayscale-50">
             <img 
               src="https://framerusercontent.com/images/beautiful-site-bg.jpg"
               alt="Background Preview" 
               className="w-125 rounded-3xl shadow-2xl border border-slate-100"
             />
          </div>

          <div className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-105">
            <div className="bg-white p-3 rounded-4xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-slate-100">
              
              <img 
                src="/drag-and-drop.gif" 
                alt="Drag and Drop Animation"
                className="w-full rounded-3xl shadow-2xl transition-transform hover:scale-[1.02] duration-500"
              />

              
            </div>
           <div className="absolute -bottom-12 -left-40 z-30"> 
        <div className="bg-white p-2 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-50 overflow-hidden w-95 h-55 flex items-center justify-center">
          <img 
            src={NewStatusImage}
            alt="Feature Detail"
            className="w-full h-full object-cover rounded-[20px]"
          />
        </div>
      </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};