import React, { useEffect } from "react";
import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";
import SectionRenderer from "./SectionRenderer";
import CustomModal from "./CustomModal";
import { Plus } from "lucide-react";
import CanvasElement from "./CanvasElement";

export default function EditorLayout({ store }) {
  const { state, closeModal, deletePage, renamePage } = store;
  const activePage = state.pages.find((p) => p.id === state.activePageId);

  // 1. منطق تحديد أبعاد الكانفاس والسكيل بناءً على وضع العرض
  const getCanvasConfig = () => {
    if (state.viewMode === 'mobile') return { width: '375px', scale: 0.8 }; 
    if (state.viewMode === 'tablet') return { width: '768px', scale: 0.7 }; 
    return { width: '100%', scale: 1 }; // Desktop
  };

  const { width, scale } = getCanvasConfig();

  // 2. إدارة اختصارات لوحة المفاتيح (Shortcuts)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // التحقق من أن المستخدم لا يكتب في input أو text editor لمنع تداخل الاختصارات
      const isEditing = document.activeElement.tagName === 'INPUT' || 
                        document.activeElement.tagName === 'TEXTAREA' || 
                        document.activeElement.isContentEditable;

      if (isEditing) return;

      // التراجع (Undo)
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        store.undo();
      }

      // النسخ (Copy)
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (state.selectedElementIds?.length > 0) {
          e.preventDefault();
          store.copyElements(state.selectedElementIds);
        }
      }

      // اللصق (Paste)
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        e.stopImmediatePropagation(); 
        if (state.clipboard && state.clipboard.length > 0) {
          store.pasteElements();
        }
      }

      // الحذف (Delete)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        state.selectedElementIds?.forEach(id => store.deleteElement(id));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [state.selectedElementIds, state.clipboard, store]);

  // لمراقبة العرض في الـ Console أثناء التطوير
  console.log("Current Mode:", state.viewMode, "Width:", width, "Scale:", scale);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f2f5", overflow: "hidden" }}>
      <TopBar store={store} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        
        <LeftSidebar store={store} />

        <main style={{ 
          flex: 1, 
          backgroundColor: "#cbd5e1", // لون الخلفية المحيطة بالكانفاس
          padding: '40px', 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "flex-start",
          overflow: "auto",
          position: "relative"
        }}>
  
          {state.pages.length > 0 ? (
            /* CanvasElement: المكون المسؤول عن حسابات رمي العناصر (Drag & Drop) */
            <CanvasElement store={store} scale={scale}>
              <div
                id="main-canvas"
                className="main-canvas-area"
                style={{
                  // الإعدادات الديناميكية للعرض والسكيل لضمان استجابة المحرر
                  width: width, 
                  minWidth: width === '100%' ? 'auto' : width,
                  backgroundColor: state.canvasStyles?.backgroundColor || "#ffffff",
                  minHeight: state.canvasHeight || "100vh", 
                  
                  // السكيل يطبق هنا في الزاوية العلوية المركزية
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  
                  transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s ease", 
                  position: "relative", 
                  boxShadow: state.viewMode === 'desktop' ? "none" : "0 10px 50px rgba(0,0,0,0.15)", 
                  margin: "0 auto",
                  
                  // overflow: visible ضروري جداً لكي لا تلتصق العناصر بالحواف عند السحب
                  overflow: "visible", 
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {activePage?.sections?.length > 0 ? (
                  activePage.sections.map((section) => (
                    <SectionRenderer
                      key={section.id}
                      section={section}
                      store={store}
                      canvasScale={scale} // نمرر السكيل لإصلاح دقة أدوات الـ Moveable
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
            /* واجهة إضافة أول صفحة في حال كان المشروع فارغاً */
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

      {/* --- قسم المودالات (Modals) --- */}

      {/* مودال حذف الصفحة */}
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

      {/* مودال نجاح الحفظ */}
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

      {/* مودال تغيير اسم الصفحة */}
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