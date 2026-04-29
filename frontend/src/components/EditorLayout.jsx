import React,{useEffect} from "react";
import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";
import SectionRenderer from "./SectionRenderer";
import CustomModal from "./CustomModal";
import { Plus } from "lucide-react";
import CanvasElement from "./CanvasElement";

export default function EditorLayout({ store }) {
  const { state , closeModal, deletePage, renamePage} = store;
  const activePage = state.pages.find((p) => p.id === state.activePageId);

  // 1. الدالة يجب أن تكون هنا (قبل الاستخدام)
  const getCanvasConfig = () => {
    if (state.viewMode === 'mobile') {
      return { width: '375px', scale: 0.8 }; 
    }
    if (state.viewMode === 'tablet') {
      return { width: '768px', scale: 0.7 }; // قللت السكيل قليلاً ليظهر كحجم "وسط" حقيقي
    }
    return { width: '100%', scale: 1 }; // Desktop
  };

  // 2. استخراج القيم من الدالة
  const { width, scale } = getCanvasConfig();

useEffect(() => {
  const handleKeyDown = (e) => {
    // التراجع Ctrl + Z
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      store.undo();
    }

    // الحذف Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement.tagName !== 'INPUT' && !document.activeElement.isContentEditable) {
        state.selectedElementIds?.forEach(id => store.deleteElement(id));
      }
    }

    // النسخ Ctrl + C (التعديل هنا)
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      // فقط إذا كان هناك عنصر محدد ولسنا داخل وضع تعديل نص
      if (state.selectedElementIds?.length > 0 && !document.activeElement.isContentEditable) {
        e.preventDefault(); // يمنع نسخ النص العادي
        store.copyElements(state.selectedElementIds);
      }
    }

    // اللصق Ctrl + V (التعديل هنا)
    if (e.ctrlKey && e.key.toLowerCase() === 'v') {
      if (state.clipboard?.length > 0 && !document.activeElement.isContentEditable) {
        e.preventDefault(); // يمنع لصق نصوص الويندوز الخارجية
        store.pasteElements();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [state.selectedElementIds, state.clipboard, store]); // أضيفي clipboard للمراقبة

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f2f5", overflow: "hidden" }}>
      <TopBar store={store} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        
        <LeftSidebar store={store} />

      <main style={{ 
  flex: 1, 
  backgroundColor: "#cbd5e1", 
  padding: '40px', 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "flex-start",
  overflow: "auto",
}}>
  
  {state.pages.length > 0 ? (
    /* طبقة واحدة فقط للتحكم في الحجم واللون والسكيل */
    <CanvasElement store={store}>
      <div
        className="main-canvas-area"
        style={{
          width: width, 
          backgroundColor: state.canvasStyles?.backgroundColor || "#ffffff",
          minHeight: state.canvasHeight || "800px", 
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          transition: "transform 0.4s ease, background-color 0.3s ease",
          position: "relative", 
          flexShrink: 0,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)", 
          margin: "0 auto",
          overflow: "visible", 
        }}
      >
        {activePage?.sections?.length > 0 ? (
          activePage.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              store={store}
              canvasScale={scale} 
              onSelect={(id) => store.selectItems([id])}
              selectedElementIds={state.selectedElementIds || []} // تأكدي من المسمى هنا
            />
          ))
        ) : (
          /* تنبيه بسيط إذا كانت الصفحة فارغة فعلياً */
          <div style={{ padding: "100px", textAlign: "center", color: "#94a3b8" }}>
            This page is empty. Use the sidebar to add sections.
          </div>
        )}
      </div>
    </CanvasElement>
  ) : (
    /* واجهة الحالة الفارغة (إضافة صفحة) */
    <div 
      onClick={() => store.addPage("Main Page")}
      style={{
        width: '300px',
        height: '200px',
        marginTop: '100px',
        border: '2px dashed #94a3b8',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#64748b',
        gap: '12px',
        background: 'rgba(255,255,255,0.5)',
        transition: 'all 0.3s ease'
      }}
    >
      <Plus size={48} strokeWidth={1.5} />
      <span style={{ fontWeight: '600' }}>Add your first page</span>
    </div>
  )}
</main>
        <RightPanel store={store} />
      </div>
{/* الحل الصحيح لاستدعاء المودال في EditorLayout */}
<CustomModal 
  isOpen={state.modal?.isOpen && state.modal?.type === "deletePage"}
  title="Delete Page"
  confirmText="Delete"
  isDanger={true}
  onConfirm={() => {
    // تأكد من تمرير القيمة النصية فقط (ID)
    if (state.modal?.data?.pageId) {
      deletePage(state.modal.data.pageId);
    }
    closeModal();
  }}
  onCancel={closeModal}
>
  {/* تأكد أنك تكتب نصاً هنا وليس Object */}
 Are you sure you want to delete this page? This action cannot be undone
</CustomModal>
{/* مودال نجاح الحفظ */}
<CustomModal 
  isOpen={state.modal?.isOpen && state.modal?.type === "saveSuccess"}
  title="Project Saved"
  confirmText="OK"
  onConfirm={closeModal}
showCancel={false}>

  <div style={{ textAlign: 'center', padding: '10px 0' }}>
    <div style={{ 
      fontSize: '40px', 
      marginBottom: '15px', 
      color: '#10b981' 
    }}>
     
    </div>
    <p style={{ color: '#475569', lineHeight: '1.6' }}>
      {state.modal?.data?.message || "All changes are secured now."}
    </p>
  </div>
</CustomModal>
{/* مودال إعادة تسمية الصفحة */}
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
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        outline: 'none',
        fontSize: '14px'
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const newName = e.target.value;
          if (newName.trim()) {
            renamePage(state.modal.data.pageId, newName);
            closeModal();
          }
        }
      }}
    />
  </div>
</CustomModal>
    </div>
  );
}