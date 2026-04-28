import React from "react";
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f0f2f5", overflow: "hidden" }}>
      <TopBar store={store} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        
        <LeftSidebar store={store} />

        <main style={{ 
  flex: 1, 
  backgroundColor: "#cbd5e1", 
  padding: '40px', // حشوة ثابتة لضمان وجود مساحة
  display: "flex", 
  justifyContent: "center", 
  alignItems: "flex-start",
  overflow: "auto",
}}>
  
  {/* إذا كان هناك صفحات، اعرض الكانفاس، وإلا اعرض زر الإضافة */}
  {state.pages.length > 0 ? (
    <div style={{ 
        width: width, 
        transform: `scale(${scale})`, 
        transformOrigin: "top center",
        transition: 'transform 0.4s ease',
        flexShrink: 0
    }}>
    <CanvasElement store={store}>
  <div
    style={{
      width: width,
      transform: `scale(${scale})`,
      transformOrigin: "top center",
      transition: "transform 0.4s ease",
      flexShrink: 0,
    }}
  >
    {activePage?.sections?.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            store={store}
            // مرري الـ scale للـ SectionRenderer
            canvasScale={scale} 
            onSelect={(id) => store.selectItems([id])}
            selectedElementIds={state.selected}
          />
        ))}
      </div>
</CanvasElement>
    </div>
  ) : (
    /* واجهة الحالة الفارغة (Empty State) */
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
      onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
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