import React, { useEffect } from "react";
import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";
import SectionRenderer from "./SectionRenderer";
import CustomModal from "./CustomModal";
import { Plus, Group, Ungroup, Palette } from "lucide-react";
import CanvasElement from "./CanvasElement";

export default function EditorLayout({ store,onSave }) {
  const { state, closeModal, deletePage, renamePage } = store;
  const activePage = state.pages?.find((p) => p.id === state.activePageId);
  const getCanvasConfig = () => {
    if (state.viewMode === 'mobile') return { width: '375px', scale: 0.8 }; 
    if (state.viewMode === 'tablet') return { width: '768px', scale: 0.7 }; 
    return { width: '100%', scale: 1 };  
  };

  const { width, scale } = getCanvasConfig();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isEditing = document.activeElement.tagName === 'INPUT' || 
                        document.activeElement.tagName === 'TEXTAREA' || 
                        document.activeElement.isContentEditable;

      if (isEditing) return;

      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        store.undo();
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (state.selectedElementIds?.length > 0) {
          e.preventDefault();
          store.copyElements(state.selectedElementIds);
        }
      }

      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        e.stopImmediatePropagation(); 
        if (state.clipboard && state.clipboard?.length > 0) {
          store.pasteElements();
        }
      }

     if (e.key === "Delete" || e.key === "Backspace") {
  state.selectedElementIds?.forEach(id => {
    const isSection = activePage?.sections?.some(s => s.id === id);

    if (isSection) {
      store.deleteSection(id);
    } else {
      store.deleteElement(id);
    }
  });
}
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [state.selectedElementIds, state.clipboard, store]);
// داخل EditorLayout.jsx قبل الـ return
const styles = {
  groupBtn: {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    margin: '0 10px'
  }
};

const selectedIds = state.selectedElementIds || [];


const hasGroup =
  activePage?.groups?.some(g =>
    selectedIds.every(id => g.elementIds.includes(id))
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f2f5", overflow: "hidden" }}>
      <TopBar store={store} onSave={onSave} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        
        <LeftSidebar store={store} />

        <main style={{ 
         flex: 1, 
  backgroundColor: "#cbd5e1",
  padding: '40px', 
  display: "flex", 
  flexDirection: "row", // ترتيب العناصر أفقياً
  justifyContent: "center", // توسيط المجموعة كاملة
  alignItems: "flex-start", // البدء من الأعلى
  overflow: "auto",
  position: "relative",
  gap: "20px" // مسافة بين الشريط العمودي والكانفاس
        }}>

{state.pages?.length > 0 && (
  <div style={{ 
    position: "absolute", 
    top: "8px", // مسافة بسيطة من الأعلى
    left: "54%", // توسيط
    transform: "translateX(-50%)", // موازن التوسيط مع عرض الكانفاس
    width: width, // نفس عرض الكانفاس ليكون محاذياً له
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "10 0px",
    marginBottom: "10px", // مسافة تفصلها عن بداية الكانفاس الأبيض
    background: "transparent", // بدون خلفية
    pointerEvents: "none" // لكي لا يمنع الضغط على ما تحته
  }}>
    
    {/* أيقونة اختيار اللون */}
    <div style={{ 
      position: "relative", 
      display: "flex", 
      alignItems: "center", 
      color: "#475569",
      cursor: "pointer",
      pointerEvents: "auto" // تفعيل الضغط للأيقونة فقط
    }}>
      <Palette size={20} strokeWidth={1.5} />
      <input 
        type="color" 
        value={state.canvasStyles?.backgroundColor || "#ffffff"} 
        onChange={(e) => store.updateCanvasStyles({ backgroundColor: e.target.value })} 
        style={{ position: "absolute", opacity: 0, inset: 0, cursor: "pointer" }}
      />
    </div>

    {/* خط فاصل */}
    {selectedIds.length > 1 && (
      <div style={{ width: "1px", height: "14px", backgroundColor: "#94a3b8" }} />
    )}

    {/* أيقونات التجميع */}
    {selectedIds.length > 1 && (
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          !hasGroup ? store.groupSelectedItems() : store.ungroupSelectedItems();
        }}
        style={{
          background: "none",
          border: "none",
          color: "#4f46e5",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: "0",
          pointerEvents: "auto" // تفعيل الضغط للزر فقط
        }}
      >
        {!hasGroup ? <Group size={22} strokeWidth={1.5} /> : <Ungroup size={22} strokeWidth={1.5} />}
      </button>
    )}
  </div>
)}

 {state.pages?.length > 0 ? (
            <CanvasElement store={store} scale={scale}>
             <div
  id="canvas-content"
  className="main-canvas-area"
  style={{
    width: width, 
    minWidth: width === '100%' ? 'auto' : width,
    /* عدنا للوضع الطبيعي البسيط */
    backgroundColor: state.canvasStyles?.backgroundColor || "#ffffff", 
    minHeight: state.canvasHeight || "100vh", 
    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s ease", 
    position: "relative", 
    margin: "0 auto",
    overflow: "visible", 
    display: "flex",
    flexDirection: "column",
    gap: "0px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)" 
  }}
>
                {activePage?.sections?.length > 0 ? (
                  activePage.sections?.map((section) => (
                    <SectionRenderer
                      key={section.id}
                      section={section}
                      store={store}
                      canvasScale={scale}
                      onSelect={(id) => store.selectItems([id])}
                      selectedElementIds={state.selectedElementIds || []}
                    />
                  ))
                ) : (
                  <div style={{ padding: "100px", textAlign: "center", color: "#94a3b8" }}>
                    This page is empty. Use the sidebar to add sections.
                  </div>
                )}
              </div>
            </CanvasElement>
          ) : (
            <div 
              onClick={() => store.addPage("Main Page")}
              style={{
                width: '300px', height: '200px', marginTop: '100px',
                border: '2px dashed #94a3b8', borderRadius: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#64748b',
                gap: '12px', background: 'rgba(255,255,255,0.5)', transition: 'all 0.3s ease'
              }}
            >
              <Plus size={48} strokeWidth={1.5} />
              <span style={{ fontWeight: '600' }}>Add your first page</span>
            </div>
          )}
        </main>

        <RightPanel store={store} />
      </div>
      <CustomModal 
        isOpen={state.modal?.isOpen && state.modal?.type === "deletePage"}
        title="Delete Page"
        confirmText="Delete"
        isDanger={true}
        onConfirm={() => {
          if (state.modal?.data?.pageId) {
            deletePage(state.modal.data.pageId);
          }
          closeModal();
        }}
        onCancel={closeModal}
      >
        Are you sure you want to delete this page? This action cannot be undone.
      </CustomModal>

      <CustomModal 
        isOpen={state.modal?.isOpen && state.modal?.type === "saveSuccess"}
        title="Project Saved"
        confirmText="OK"
        onConfirm={closeModal}
        showCancel={false}
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '15px', color: '#10b981' }}>✓</div>
          <p style={{ color: '#475569', lineHeight: '1.6' }}>
            {state.modal?.data?.message || "All changes are secured now."}
          </p>
        </div>
      </CustomModal>

      <CustomModal 
        isOpen={state.modal?.isOpen && state.modal?.type === "renamePage"}
        title="Rename Page"
        confirmText="Save Name"
        onConfirm={() => {
          const newName = document.getElementById('rename-input').value;
          if (newName.trim()) {
            renamePage(state.modal.data.pageId, newName);
            closeModal();
          }
        }}
        onCancel={closeModal}
      >
        <div style={{ padding: '10px 0' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
            Enter new page name:
          </label>
          <input 
            id="rename-input"
            type="text" 
            defaultValue={state.modal?.data?.currentName}
            autoFocus
            style={{
              width: '100%', padding: '10px', borderRadius: '6px',
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const n = e.target.value;
                if (n.trim()) { renamePage(state.modal.data.pageId, n); closeModal(); }
              }
            }}
          />
        </div>
      </CustomModal>
    </div>
  );
}