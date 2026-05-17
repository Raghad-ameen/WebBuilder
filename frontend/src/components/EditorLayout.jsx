import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel"; 
import SectionRenderer from "./SectionRenderer";
import CustomModal from "./CustomModal";
import { Plus, Group, Ungroup, Palette, ChevronDown } from "lucide-react"; 
import CanvasElement from "./CanvasElement";

export default function EditorLayout({ store, onSave }) {
  const { state, closeModal, deletePage, renamePage } = store;
  const activePage = state.pages?.find((p) => p.id === state.activePageId);
  const [dynamicScale, setDynamicScale] = useState(1);
  
  const getCanvasWidth = () => {
    if (state.viewMode === 'mobile') return 375; 
    if (state.viewMode === 'tablet') return 640; 
    return 1024; 
  };

  const canvasWidth = getCanvasWidth();

  useEffect(() => {
    const updateScale = () => {
      const mainArea = document.querySelector('main');
      if (!mainArea) return;

      const paddingOffset = state.viewMode === 'desktop' ? 120 : 60;
      const availableWidth = mainArea.offsetWidth - paddingOffset; 

      if (state.viewMode === 'mobile') {
        setDynamicScale(availableWidth < 375 ? availableWidth / 375 : 1);
      } 
      else if (state.viewMode === 'tablet') {
        setDynamicScale(availableWidth < 640 ? availableWidth / 640 : 1);
      } 
      else {
        if (availableWidth < 1024) {
          const calculatedScale = availableWidth / 1024;
          setDynamicScale(Math.max(calculatedScale, 0.70));
        } else {
          setDynamicScale(1); 
        }
      }
    };

    window.addEventListener('resize', updateScale);
    updateScale();
    return () => window.removeEventListener('resize', updateScale);
  }, [state.viewMode, canvasWidth]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isEditing = document.activeElement.tagName === 'INPUT' || 
                        document.activeElement.tagName === 'TEXTAREA' || 
                        document.activeElement.isContentEditable;

      if (isEditing) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); store.undo(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'c') { if (state.selectedElementIds?.length > 0) { e.preventDefault(); store.copyElements(state.selectedElementIds); } }
      if (e.ctrlKey && e.key.toLowerCase() === 'v') { e.preventDefault(); e.stopImmediatePropagation(); if (state.clipboard?.length > 0) { store.pasteElements(); } }
      if (e.key === "Delete" || e.key === "Backspace") {
        state.selectedElementIds?.forEach(id => {
          const isSection = activePage?.sections?.some(s => s.id === id);
          if (isSection) { store.deleteSection(id); } else { store.deleteElement(id); }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [state.selectedElementIds, state.clipboard, store, activePage]);

  const selectedIds = state.selectedElementIds || [];
  const hasGroup = activePage?.groups?.some(g => selectedIds.every(id => g.elementIds.includes(id)));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f8fafc", overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
      <TopBar store={store} onSave={onSave} />
      
      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%", position: "relative" }}>
        {/* شريط الأدوات المطور بستايل كانفا (تلقائياً يحوي شريط الأيقونات والدرج) */}
        <LeftSidebar store={store} />

        {/* منطقة العمل الرئيسية المفتوحة والواسعة جداً */}
        <main style={{ 
          flex: 1, 
          backgroundColor: "#edeef0", 
          padding: '16px 24px 120px 24px', 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "flex-start",
          overflow: "auto",
          position: "relative",
          gap: "16px"
        }}>
          
          {/* حاوية شريط الأدوات العائمة (RightPanel تظهر هنا أفقياً كشريط خصائص علوي) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", position: "sticky", top: 0, zIndex: 100, gap: "10px", pointerEvents: "none" }}>
            <RightPanel store={store} />

            {state.pages?.length > 0 && (
              <div style={{ 
                display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "12px", padding: "8px 16px", 
                height: "44px", minWidth: "120px",  pointerEvents: "auto"
              }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: "#475569", cursor: "pointer", border: "1px solid #cbd5e1" }}>
                  <Palette size={16} />
                  <input 
                    type="color" 
                    value={state.canvasStyles?.backgroundColor || "#ffffff"} 
                    onChange={(e) => store.updateCanvasStyles({ backgroundColor: e.target.value })} 
                    style={{ position: "absolute", opacity: 0, inset: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  />
                </div>

                {selectedIds.length > 1 && <div style={{ width: "1px", height: "20px", backgroundColor: "#cbd5e1" }} />}

                {selectedIds.length > 1 && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); !hasGroup ? store.groupSelectedItems() : store.ungroupSelectedItems(); }}
                    style={{ background: "#4f46e5", border: "none", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "500" }}
                  >
                    <span>{!hasGroup ? "Group" : "Ungroup"}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {state.pages?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" }}> 
              <CanvasElement store={store} width={`${canvasWidth}px`} scale={dynamicScale}>
                <div
                  id="canvas-content"
                  className="main-canvas-area"
                  style={{
                    width: "100%", 
                    backgroundColor: state.canvasStyles?.backgroundColor || "#ffffff", 
                    minHeight: state.canvasHeight || "750px", 
                    position: "relative", margin: "0 auto", overflow: "visible", 
                    display: "flex", flexDirection: "column", gap: "0px", borderRadius: "4px", 
                    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.01)"
                  }}
                >
                  {activePage?.sections?.length > 0 ? (
                    activePage.sections.map((section) => (
                      <SectionRenderer
                        key={section.id}
                        section={section}
                        store={store}
                        canvasScale={dynamicScale} 
                        onSelect={(id) => store.selectItems([id])}
                        selectedElementIds={state.selectedElementIds || []}
                      />
                    ))
                  ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px", flexDirection: "column", gap: "10px" }}>
                      <div style={{ padding: "16px", borderRadius: "50%", background: "#f1f5f9", color: "#94a3b8" }}>
                        <Plus size={32} />
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>This page is empty. Drag items here.</span>
                    </div>
                  )}
                </div>
              </CanvasElement>

              {/* متحكم الصفحات السفلي المدمج */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                <div style={{ backgroundColor: "#ffffff", padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "#1e293b", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                  <span>Page {state.pages.findIndex(p => p.id === state.activePageId) + 1} of {state.pages.length}</span>
                </div>
                <button
                  onClick={() => store.addPage(`Page ${state.pages.length + 1}`)}
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => store.addPage("Main Page")}
              style={{ width: '320px', height: '220px', marginTop: '100px', border: '2px dashed #cbd5e1', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', gap: '14px', background: '#ffffff', boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
            >
              <div style={{ padding: "12px", borderRadius: "50%", background: "#f0fdf4", color: "#16a34a" }}>
                <Plus size={32} />
              </div>
              <span style={{ fontWeight: '600', fontSize: "15px" }}>Add your first page</span>
            </div>
          )}
        </main>
      </div>

      {/* المودالز الثابتة */}
      <CustomModal isOpen={state.modal?.isOpen && state.modal?.type === "deletePage"} title="Delete Page" confirmText="Delete" isDanger={true} onConfirm={() => { if (state.modal?.data?.pageId) deletePage(state.modal.data.pageId); closeModal(); }} onCancel={closeModal}>Are you sure you want to delete this page?</CustomModal>
      <CustomModal isOpen={state.modal?.isOpen && state.modal?.type === "saveSuccess"} title="Project Saved" confirmText="OK" onConfirm={closeModal} showCancel={false}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '40px', color: '#10b981' }}>✓</div><p>{state.modal?.data?.message || "All changes are secured now."}</p></div></CustomModal>
      <CustomModal isOpen={state.modal?.isOpen && state.modal?.type === "renamePage"} title="Rename Page" confirmText="Save Name" onConfirm={() => { const newName = document.getElementById('rename-input').value; if (newName.trim()) { renamePage(state.modal.data.pageId, newName); closeModal(); } }} onCancel={closeModal}>
        <input id="rename-input" type="text" defaultValue={state.modal?.data?.currentName} autoFocus style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
      </CustomModal>
    </div>
  );
}