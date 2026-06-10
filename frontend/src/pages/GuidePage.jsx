import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer2, Layout, Palette, ChevronRight, 
  Laptop, Tablet, Smartphone, Type, Sliders, Plus, CheckCircle, Loader2, Image as ImageIcon
} from 'lucide-react';

const MockTopBar = ({ activeDevice, onDeviceChange, isSaving, showSuccess }) => (
  <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center px-6">
    <div className="flex gap-2 text-indigo-600 font-black text-sm uppercase italic">SP <span className="text-slate-400 font-medium">StructPeak</span></div>
    <div className="flex gap-3 bg-slate-100 p-1 rounded-xl">
      <button className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${activeDevice === 'laptop' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Laptop size={16}/></button>
      <button className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${activeDevice === 'tablet' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Tablet size={16}/></button>
      <button className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${activeDevice === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}><Smartphone size={16}/></button>
    </div>
    <button className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-500 flex items-center gap-2 ${showSuccess ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white shadow-indigo-100 shadow-lg'}`}>
      {isSaving ? <Loader2 size={14} className="animate-spin" /> : showSuccess ? <CheckCircle size={14} /> : "Save Work"}
    </button>
  </div>
);

const AddSectionPreview = () => (
  <div className="w-full max-w-5xl mx-auto bg-slate-200 rounded-3xl shadow-xl overflow-hidden border border-slate-300 flex flex-col h-100 mb-20">
    <MockTopBar activeDevice="laptop" />
    <div className="flex flex-1 overflow-hidden">
      <div className="w-20 bg-white border-r border-slate-100 flex flex-col items-center py-8 gap-6">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-12 h-12 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm"><Layout size={24} /></motion.div>
        <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-200"><Plus size={20} /></div>
      </div>
      <div className="flex-1 p-10 flex items-center justify-center relative">
        <div className="w-full h-full bg-white rounded-xl shadow-inner border border-slate-100 p-6 relative">
          <motion.div animate={{ x: [-150, 50, 50], y: [100, 0, 0], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute z-50 flex flex-col items-center">
            <div className="bg-indigo-600 text-white px-4 py-2 rounded shadow-2xl text-[10px] font-bold uppercase tracking-widest">Header Section</div>
            <MousePointer2 className="text-indigo-900 fill-indigo-900 -mt-2 -ml-4" size={24} />
          </motion.div>
          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-full h-full border-2 border-indigo-500 border-dashed rounded-2xl bg-indigo-50/50 flex items-center justify-center font-black text-indigo-300">CONTENT AREA</motion.div>
        </div>
      </div>
    </div>
  </div>
);

const VisualStylingPreview = () => (
  <div className="w-full max-w-5xl mx-auto bg-slate-200 rounded-3xl shadow-xl overflow-hidden border border-slate-300 flex flex-col h-100 mb-20">
    <MockTopBar activeDevice="laptop" />
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 p-10 flex items-center justify-center relative">
        <div className="w-full h-full bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center">
          <motion.div animate={{ backgroundColor: ["#4f46e5", "#ec4899", "#4f46e5"], borderRadius: ["4px", "40px", "4px"] }} transition={{ duration: 4, repeat: Infinity }} className="w-64 h-16 flex items-center justify-center text-white font-black tracking-widest shadow-2xl relative">
            EDITABLE ELEMENT
            <div className="absolute -inset-2 border-2 border-indigo-400 rounded-lg animate-pulse" />
          </motion.div>
        </div>
      </div>
      <div className="w-72 bg-white border-l border-slate-100 p-6 flex flex-col gap-6">
        <h3 className="text-xs font-black text-slate-800 border-b pb-3 uppercase tracking-tighter">Visual Editor</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Background Color</label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <motion.div animate={{ backgroundColor: ["#4f46e5", "#ec4899", "#4f46e5"] }} transition={{ duration: 4, repeat: Infinity }} className="w-8 h-8 rounded-lg shadow-sm" />
              <div className="w-20 h-2 bg-slate-200 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Border Radius</label>
            <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
               <motion.div animate={{ width: ["10%", "90%", "10%"] }} transition={{ duration: 4, repeat: Infinity }} className="absolute h-full bg-indigo-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ResponsivePreview = () => {
  const [view, setView] = useState('laptop');
  const widths = { laptop: '100%', tablet: '60%', mobile: '35%' };

  useEffect(() => {
    const interval = setInterval(() => {
      const views = ['laptop', 'tablet', 'mobile'];
      setView(prev => views[(views.indexOf(prev) + 1) % views.length]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-200 rounded-3xl shadow-xl overflow-hidden border border-slate-300 flex flex-col h-100 mb-20">
      <MockTopBar activeDevice={view} />
      <div className="flex-1 p-6 flex items-center justify-center bg-slate-300/50">
        <motion.div animate={{ width: widths[view] }} transition={{ type: 'spring', stiffness: 100, damping: 20 }} className="h-full bg-white rounded-2xl shadow-2xl border border-white flex flex-col p-4 overflow-hidden">
          <div className="w-full h-32 bg-slate-50 rounded-xl mb-4 border border-slate-100 flex items-center justify-center">
             <div className="w-12 h-12 rounded-full bg-indigo-100 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-3/4 h-3 bg-slate-100 rounded-full" />
            <div className="w-full h-3 bg-slate-50 rounded-full" />
            <div className="w-1/2 h-3 bg-slate-50 rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SaveProcessPreview = () => {
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus('saving');
      setTimeout(() => setStatus('success'), 1500);
      setTimeout(() => setStatus('idle'), 4500);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-200 rounded-3xl shadow-xl overflow-hidden border border-slate-300 flex flex-col h-100">
      <MockTopBar isSaving={status === 'saving'} showSuccess={status === 'success'} activeDevice="laptop" />
      <div className="flex-1 flex items-center justify-center relative bg-slate-50">
        
        <AnimatePresence>
          {status === 'success' && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} className="absolute bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center z-20 border border-white">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                <CheckCircle size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">Sync Complete!</h4>
                <p className="text-slate-500 text-sm">Your masterpiece is safely stored.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The "Not Empty" Canvas Content */}
        <div className={`w-full max-w-2xl bg-white shadow-sm rounded-xl p-8 transition-all duration-700 ${status === 'success' ? 'blur-sm grayscale opacity-30 scale-95' : 'opacity-100'}`}>
           <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-200 border-2 border-dashed border-indigo-100">
                <ImageIcon size={32} />
              </div>
              <div className="space-y-3 flex-1">
                <div className="h-4 w-1/3 bg-slate-100 rounded-full" />
                <div className="h-3 w-full bg-slate-50 rounded-full" />
                <div className="h-3 w-2/3 bg-slate-50 rounded-full" />
              </div>
           </div>
           <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-200">
                  <Layout size={20} />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default function GuidePage() {
  const handleStartAction = () => {
    const isLoggedIn = false;
    
    if (isLoggedIn) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-40 px-6 overflow-x-hidden" dir="ltr">
      <section className="py-24 text-center">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-7xl font-black mb-8 tracking-tighter italic">
          Powering Your <span className="text-indigo-600">Creativity.</span>
        </motion.h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto font-medium">The most intuitive way to build professional web interfaces.</p>
      </section>

      <div className="space-y-32">
        <StepSection num="1" title="Build Architecture" desc="Drag complex sections onto your canvas to build the structure." component={<AddSectionPreview />} />
        <StepSection num="2" title="Fine-Tune Styles" desc="Click any element to unlock total visual control in the sidebar." component={<VisualStylingPreview />} />
        <StepSection num="3" title="Review Every Device" desc="Ensure your site looks perfect on Desktop, Tablet, and Mobile." component={<ResponsivePreview />} />
        <StepSection num="4" title="Publish & Save" desc="One click to save your work. Secure, fast, and always ready." component={<SaveProcessPreview />} />
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={handleStartAction}
          className="bg-slate-900 text-white px-16 py-5 rounded-full font-black text-xl shadow-2xl flex items-center gap-4 hover:bg-slate-900 transition-colors duration-300"
        >
          Start StructPeak Now <ChevronRight size={24} />
        </motion.button>
      </div>
    </div>
  );
}

const StepSection = ({ num, title, desc, component }) => (
  <section className="max-w-5xl mx-auto">
    <div className="mb-10 space-y-2">
        <div className="flex items-center gap-4">
            <span className="text-indigo-600 font-black text-4xl opacity-20">0{num}</span>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">{title}</h2>
        </div>
        <p className="text-slate-400 font-medium ml-14">{desc}</p>
    </div>
    {component}
  </section>
);