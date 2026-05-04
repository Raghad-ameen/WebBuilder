import React from 'react';
import { MousePointer2, Zap, Layout } from 'lucide-react';

const features = [
  {
    title: "Easy Drag & Drop",
    desc: "No coding required. Just pick a block, drop it, and customize your site visually.",
    icon: <MousePointer2 className="w-6 h-6 text-indigo-500" />,
    hoverBorder: "hover:border-indigo-500/40", 
  },
  {
    title: "Ultra Fast Loading",
    desc: "We optimize every image and script so your website loads instantly for everyone.",
    icon: <Zap className="w-6 h-6 text-fuchsia-500" />,
    hoverBorder: "hover:border-fuchsia-500/40",
  },
  {
    title: "Fully Responsive",
    desc: "Your website will look perfect on iPhones, tablets, and desktop computers automatically.",
    icon: <Layout className="w-6 h-6 text-indigo-500" />,
    hoverBorder: "hover:border-indigo-500/40",
  }
];

export const FeatureGrid = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <h2 className="text-slate-950 text-5xl md:text-6xl font-black leading-[0.95] tracking-tighter mb-6">
            Everything you need to <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-fuchsia-600">
              scale your business
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, index) => (
            <div 
              key={index}
              className={`
                p-10 rounded-[2.5rem] border transition-all duration-500 ease-out group relative
                bg-slate-50/50 border-slate-200/60 
                
                hover:bg-white hover:-translate-y-3 hover:shadow-[0_32px_64px_-15px_rgba(79,70,229,0.15)]
                ${f.hoverBorder}
              `}
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              
              <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">
                {f.title}
              </h3>
              
              <p className="text-slate-500 leading-relaxed font-medium text-lg">
                {f.desc}
              </p>

              <div className="absolute bottom-0 left-12 right-12 h-1 bg-linear-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};