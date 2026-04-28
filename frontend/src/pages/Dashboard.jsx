import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSites = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://127.0.0.1:8000/api/websites/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSites(res.data);
      } catch (err) {
        console.error("Error fetching sites", err);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans" dir="ltr">

      <div className="p-8 md:p-16 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-[#0a0026] tracking-tighter">My Projects</h2>
            <p className="text-slate-500 mt-2 font-medium">Manage and edit your professional websites.</p>
          </div>
          
          <Link 
            to="/editor" 
            className="group flex items-center gap-2 bg-[#0a0026] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-blue-950 transition-all active:scale-95"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
            Create New Site
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sites.map((site) => (
              <div key={site.id} className="group bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                {/* Site Preview Placeholder */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-teal-500/10 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-500 opacity-20">🌐</span>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-xl text-slate-900 tracking-tight">{site.name}</h3>
                      <p className="text-sm text-slate-400 font-medium">/{site.slug}</p>
                    </div>
                    <span className="bg-green-100 text-green-600 text-[10px] font-black uppercase px-2 py-1 rounded-md">Live</span>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                    onClick={() => {
                if(site.is_active) {
                   navigate(`/editor/${site.id}`); // 👈 هنا يتم التوجيه للمحرر مع الـ ID
                } else {
                   alert("هذا الموقع معطل، تواصل مع الإدارة");
                }
              }}
                    className="flex-1 bg-slate-950 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg">
                      Edit Site
                    </button>
                    <a 
                      href={`http://127.0.0.1:8000/sites/${site.slug}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-4 bg-slate-50 text-slate-400 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-100"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {sites.length === 0 && (
              <div className="col-span-full py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-3xl">🏗️</div>
                <h3 className="text-2xl font-black text-slate-900">No sites yet</h3>
                <p className="text-slate-400 mt-2 mb-8 max-w-sm">You haven't built any masterpieces yet. Start your journey with a single click.</p>
                <Link to="/editor" className="text-emerald-600 font-bold hover:underline">Launch Editor →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;