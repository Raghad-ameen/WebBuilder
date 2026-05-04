import React from 'react';
import * as Icons from 'lucide-react';

export const FeaturesPage = () => {
  const features = [
    { title: "Lighting Fast", desc: "Optimized for speed. Your website loads in the blink of an eye.", icon: "Zap" },
    { title: "Bank-Grade Security", desc: "Your data and your users are protected with enterprise encryption.", icon: "Shield" },
    { title: "Mobile First", desc: "Responsive by design. Looks stunning on every screen size.", icon: "Smartphone" },
    { title: "Global CDN", desc: "Deploy your site to edge nodes worldwide for instant access.", icon: "Globe" },
    { title: "Clean Code", desc: "Export production-ready React and Tailwind code easily.", icon: "Code" },
    { title: "SEO Analytics", desc: "Built-in tools to help you rank #1 on search engines.", icon: "BarChart" }
  ];

  return (
    <div className="bg-[#0a0026] min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <h1 className="text-white text-6xl font-black tracking-tighter mb-6">
          Everything you need to <br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
            scale your business
          </span>
        </h1>
        <p className="text-white/50 text-xl max-w-2xl mx-auto">
          Powerful tools designed for creators, built with the latest technology.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
               <Icons.Zap className="w-6 h-6" /> 
            </div>
            <h3 className="text-white text-2xl font-bold mb-4">{f.title}</h3>
            <p className="text-white/50 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};