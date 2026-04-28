export const TemplatesPage = () => {
  const categories = ["All", "Portfolio", "Business", "E-commerce"];
  
  return (
    <div className="bg-[#0a0026] min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-white text-5xl font-black tracking-tighter mb-4">Start with a Masterpiece</h1>
          <p className="text-white/50 text-lg">Pick a template and customize it to make it yours.</p>
        </div>
        <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          {categories.map(cat => (
            <button key={cat} className="px-6 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition font-bold">
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="group cursor-pointer">
            <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 overflow-hidden mb-6 relative">
              <div className="absolute inset-0 bg-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white text-black px-8 py-3 rounded-2xl font-black shadow-2xl">Preview Template</button>
              </div>
              {/* ضع صور القوالب هنا */}
              <div className="w-full h-full bg-linear-to-br from-emerald-500/10 to-fuchsia-500/10" />
            </div>
            <h3 className="text-white text-xl font-bold">Modern SaaS Template 0{i}</h3>
            <p className="text-white/30">Clean, Fast, Responsive</p>
          </div>
        ))}
      </div>
    </div>
  );
};