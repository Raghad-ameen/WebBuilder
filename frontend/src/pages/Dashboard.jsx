import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSiteData, setNewSiteData] = useState({ name: '', slug: '' });
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchSites = async () => {
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
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchSites();
  }, [navigate, token]);

  const handleCreateSite = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/websites/', newSiteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/editor/${res.data.id}`); 
    } catch (err) {
      alert("Error: Check if the slug is unique or fill all fields.");
      console.error(err.response?.data);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans" dir="ltr">
      <div className="p-8 md:p-16 max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-[#0a0026] tracking-tighter">My Projects</h2>
            <p className="text-slate-500 mt-2 font-medium">Manage and edit your professional websites.</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 bg-[#0a0026] text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-blue-950 transition-all active:scale-95"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
            Create New Site
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sites.map((site) => (
              <div key={site.id} className="group bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                <div className="aspect-video bg-slate-100 relative flex items-center justify-center text-4xl">🌐</div>
                <div className="p-8">
                  <h3 className="font-black text-xl text-slate-900">{site.name}</h3>
                  <p className="text-sm text-slate-400">/{site.slug}</p>
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => navigate(`/editor/${site.id}`)}
                      className="flex-1 bg-slate-950 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Edit Site
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0a0026]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-[#0a0026] mb-2">Create New Website</h3>
            <p className="text-slate-500 mb-6 text-sm">Enter the details for your next masterpiece.</p>
            
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Site Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. My Portfolio"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  onChange={(e) => setNewSiteData({...newSiteData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">URL Slug</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 font-bold">/</span>
                  <input 
                    required
                    type="text" 
                    placeholder="my-portfolio"
                    className="w-full pl-8 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                    onChange={(e) => setNewSiteData({...newSiteData, slug: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all"
                >
                  Create & Edit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;