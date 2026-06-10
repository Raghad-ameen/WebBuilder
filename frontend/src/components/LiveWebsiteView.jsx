import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SectionRenderer from "../components/SectionRenderer";

export default function LiveWebsiteView() {
  const { siteId } = useParams();
  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

const [liveState, setLiveState] = useState({
    activePageId: "p1",
    pages: [],
    selectedSectionId: null,
    activeSectionId: null,
    selectedElementIds: [],
    isPreviewMode: true,
    isFormOpen: false,
    activeFormSectionId: null
  });
  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        setLoading(true);
const response = await axios.get(`http://127.0.0.1:8000/api/sites/${siteId}/`);
        if (response.data) {
          const data = response.data;
          setSiteData(data);
          
          const targetPages = data.pages || [];
          setLiveState(prev => ({
            ...prev,
            activePageId: targetPages[0]?.id || "p1",
            pages: targetPages
          }));
          setError(false);
        }
      } catch (err) {
        console.warn("⚠️ الباكيند عاد بـ 404، ننتقل لجلب البيانات محلياً من الـ LocalStorage...");
        
        const localProjectData = localStorage.getItem("builder_project_state") || localStorage.getItem(`project_id_${siteId}`);
        
        if (localProjectData) {
          try {
            const parsedData = JSON.parse(localProjectData);
            setSiteData(parsedData);
            
            const targetPages = parsedData.pages || [];
            
            setLiveState(prev => ({
              ...prev,
              activePageId: targetPages[0]?.id || "p1",
              pages: targetPages
            }));
            setError(false);
          } catch (parseErr) {
            setError(true);
          }
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

  if (siteId) {
      fetchSiteData();
    }
  }, [siteId]);

const mockStore = useMemo(() => ({
  state: liveState,

  setState: (updater) => {
    setLiveState(prev =>
      typeof updater === "function"
        ? updater(prev)
        : updater
    );
  },

  selectItems: () => {},
  updateItem: () => {},
  updateSection: () => {},
  deleteSection: () => {},
  deleteElement: () => {},
  previewUpdateItem: () => {},
  moveSectionUp: () => {},
  moveSectionDown: () => {}
}), [liveState]);







if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1.2rem", color: "#64748b" }}>
        Loading Your Website...
      </div>
    );
  }

  if (error || !siteData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#ef4444", marginBottom: "10px" }}>⚠️ Website Data Not Found</h2>
        <p style={{ color: "#64748b" }}>Please click "Save" in the editor first before opening the live view.</p>
      </div>
    );
  }

  const currentActivePage = liveState.pages.find(p => p.id === liveState.activePageId) || liveState.pages[0] || {};
  const sections = currentActivePage.sections || [];

  return (
 <div style={{ width: "100%", minHeight: "100vh", backgroundColor: siteData.canvasStyles?.backgroundColor || "#ffffff" }}>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          selectedElementIds={[]}
          onSelect={() => {}}
          store={mockStore}
          canvasScale={1}
        />
      ))}
    </div>
  );
}