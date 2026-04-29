import React from "react";
import { 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Save, 
  ChevronRight 
} from "lucide-react";

export default function TopBar({ store }) {
  if (!store) return null;

  // استخراج history و redoStack من الـ store لإصلاح الـ ReferenceError
  const { state, setViewMode, undo, redo, history, redoStack } = store;
  
  const activePage = state.pages.find(p => p.id === state.activePageId);

  const canUndo = history && history.length > 0;
  const canRedo = redoStack && redoStack.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.section}>
       <div style={styles.buttonGroup}>
  {/* زر التراجع Undo */}
  <button 
    onClick={undo} 
    disabled={!canUndo} 
    title="Undo (Ctrl+Z)"
    style={{
      ...styles.iconButton,
      opacity: canUndo ? 1 : 0.3,
      cursor: canUndo ? 'pointer' : 'not-allowed'
    }}
  >
    <Undo2 size={18} />
  </button>

  {/* زر الإعادة Redo - تم إصلاح علامة التعجب هنا */}
  <button 
    onClick={redo} 
    disabled={!canRedo} // تم التعديل من canRedo إلى !canRedo
    title="Redo (Ctrl+Y)"
    style={{
      ...styles.iconButton,
      opacity: canRedo ? 1 : 0.3,
      cursor: canRedo ? 'pointer' : 'not-allowed'
    }}
  >
    <Redo2 size={18} />
  </button>
</div>
        
        <div style={styles.divider} />
        
        <div style={styles.viewportSwitcher}>
          {['desktop', 'tablet', 'mobile'].map(mode => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{ 
                ...styles.modeBtn,
                background: state.viewMode === mode ? '#fff' : 'transparent',
                boxShadow: state.viewMode === mode ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                color: state.viewMode === mode ? '#4f46e5' : '#64748b'
              }}
            >
              {mode === 'desktop' && <Monitor size={16} />}
              {mode === 'tablet' && <Tablet size={16} />}
              {mode === 'mobile' && <Smartphone size={16} />}
            </button>
          ))}
        </div>
      </div>

     <div style={styles.breadcrumb}>
    <span style={styles.projectName}>{state.projectName}</span> 
    <ChevronRight size={14} color="#94a3b8" />
    <span style={styles.pageName}>{activePage?.name || 'Home'}</span>
  </div>




  {/* القسم الأيمن (استخدام styles.sectionRight) */}
  <div style={styles.sectionRight}>

    <button 
  onClick={() => store.openModal("confirmClear")}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#ef4444', // لون أحمر خفيف للزر
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  }}
  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
>
  <i className="fa-solid fa-trash-can"></i>
  Clear Page
</button>
    <button 
      onClick={() => store.saveProject()}
      style={styles.saveButton}
    >
      <Save size={16} style={{ marginRight: "6px" }} />
      Save
    </button>
  </div>

    
    </div>
  );
}

const styles = {
  container: {
   height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // يوزع المساحة بين الأقسام الثلاثة
    padding: "0 16px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    zIndex: 1000,
  },
  section: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
  },
  sectionRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flex: 1,
    justifyContent: "flex-end", // يدفع زر Save لليمين تماماً
  },
  buttonGroup: {
    display: "flex",
    gap: "2px",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    color: "#475569",
    transition: "0.2s",
    ":hover": { background: "#f1f5f9" }
  },
  divider: {
    width: "1px",
    height: "24px",
    background: "#e2e8f0",
    margin: "0 8px",
  },
  viewportSwitcher: {
    display: 'flex', 
    background: '#f1f5f9', 
    padding: '3px', 
    borderRadius: '8px', 
    gap: '2px' 
  },
  modeBtn: {
    border: 'none', 
    padding: '6px 10px', 
    borderRadius: '6px', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: '0.2s all'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8fafc',
    padding: '6px 16px', // زيادة الـ padding قليلاً ليناسب الصورة
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    // لضمان أنه لا يتقلص ويظل في المنتصف
    flexShrink: 0,
  },
  projectName: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500'
  },
  pageName: {
    fontSize: '13px',
    color: '#1e293b',
    fontWeight: '600'
  },
  saveButton: {
    background: "#4f46e5",
    border: "none",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.85rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "0.2s",
  }
};