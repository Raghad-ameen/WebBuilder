import React from "react";
import { 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Save, 
  ChevronRight,
  Eye,
  EyeOff,
  Download,
  Trash2
} from "lucide-react";

export default function TopBar({ store, exportToHTML, onSave }) {
  if (!store) return null;

  const { state, setViewMode, undo, redo, history, redoStack } = store;
  
  const activePage = state.pages.find(p => p.id === state.activePageId);

  const canUndo = history && history.length > 0;
  const canRedo = redoStack && redoStack.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.buttonGroup}>
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
            <Undo2 size={15} />
          </button>

          <button 
            onClick={redo} 
            disabled={!canRedo} 
            title="Redo (Ctrl+Y)"
            style={{
              ...styles.iconButton,
              opacity: canRedo ? 1 : 0.3,
              cursor: canRedo ? 'pointer' : 'not-allowed'
            }}
          >
            <Redo2 size={15} />
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
                boxShadow: state.viewMode === mode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                color: state.viewMode === mode ? '#4f46e5' : '#64748b'
              }}
            >
              {mode === 'desktop' && <Monitor size={14} />}
              {mode === 'tablet' && <Tablet size={14} />}
              {mode === 'mobile' && <Smartphone size={14} />}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.breadcrumb}>
        <span style={styles.projectName}>{state.projectName}</span> 
        <ChevronRight size={13} color="#94a3b8" />
        <span style={styles.pageName}>{activePage?.name || 'Home'}</span>
      </div>

      <div style={styles.sectionRight}>
        {/* 1. زر مسح الصفحة المصغر */}
        <button 
          onClick={() => store.openModal("confirmClear")}
          style={styles.clearBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.borderColor = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#fee2e2';
          }}
        >
          <Trash2 size={13} />
          Clear Page
        </button>

        {/* 2. زر المعاينة الحية المصغر */}
        <button 
          onClick={store.togglePreview}
          style={{
            ...styles.previewBtn,
            background: state.isPreviewMode ? "#10b981" : "#fff",
            color: state.isPreviewMode ? "#fff" : "#0f172a",
            border: state.isPreviewMode ? "1px solid #10b981" : "1px solid #e2e8f0"
          }}
          onMouseEnter={(e) => {
            if(!state.isPreviewMode) e.currentTarget.style.backgroundColor = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            if(!state.isPreviewMode) e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          {state.isPreviewMode ? <EyeOff size={13} /> : <Eye size={13} />}
          {state.isPreviewMode ? "Exit Preview" : "Live Preview"}
        </button>

        {/* 3. زر تصدير الكود المصغر */}
        <button 
          onClick={() => exportToHTML && exportToHTML()}
          style={styles.exportBtn}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(224, 231, 255, 0.6)'}
        >
          <Download size={13} />
          Export Code
        </button>

        {/* 4. زر الحفظ المصغر والاحترافي */}
        <button 
          onClick={() => {
            if (store.saveProject) store.saveProject(); 
            if (typeof onSave === 'function') {
              onSave();
            } else {
              console.error("onSave is not a function or not passed!");
            }
          }}
          style={styles.saveButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)';
            e.currentTarget.style.boxShadow = '0 3px 8px rgba(79, 70, 229, 0.3), inset 0 -1.5px 0px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)';
            e.currentTarget.style.boxShadow = '0 1.5px 4px rgba(79, 70, 229, 0.2), inset 0 -1.5px 0px rgba(0, 0, 0, 0.2)';
          }}
        >
          <Save size={13} />
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
    justifyContent: "space-between",
    padding: "0 16px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    zIndex: 1000,
  },
  section: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1,
  },
  sectionRight: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flex: 1,
    justifyContent: "flex-end", 
  },
  buttonGroup: {
    display: "flex",
    gap: "1px",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    padding: "6px",
    cursor: "pointer",
    borderRadius: "6px",
    display: "flex",
    color: "#475569",
    transition: "0.2s",
  },
  divider: {
    width: "1px",
    height: "20px",
    background: "#e2e8f0",
    margin: "0 6px",
  },
  viewportSwitcher: {
    display: 'flex', 
    background: '#f1f5f9', 
    padding: '2px', 
    borderRadius: '6px', 
    gap: '1px' 
  },
  modeBtn: {
    border: 'none', 
    padding: '5px 8px', 
    borderRadius: '4px', 
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: '0.15s all'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f8fafc',
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  projectName: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
  },
  pageName: {
    fontSize: '12px',
    color: '#1e293b',
    fontWeight: '600'
  },
  // 🌟 استايلات الأزرار المصغرة والمحسنة (Compact & Sleek):
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '31px', // تم التصغير من 36px
    padding: '0 10px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.78rem', // حجم خط أنعم وعصري
    fontWeight: '600',
    transition: 'all 0.15s'
  },
  previewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    height: "31px", // تم التصغير من 36px
    padding: "0 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: "600",
    transition: "all 0.15s"
  },
  exportBtn: {
    height: "31px", // تم التصغير من 36px
    padding: "0 10px",
    backgroundColor: "rgba(224, 231, 255, 0.6)",
    color: "#4f46e5",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    justifyContent: "center",
    whiteSpace: "nowrap",
    transition: "all 0.15s"
  },
  saveButton: {
    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
    border: "1px solid #4338ca",
    color: "white",
    height: "31px", // تم التصغير من 36px
    padding: "0 14px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.78rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    boxShadow: "0 1.5px 4px rgba(79, 70, 229, 0.2), inset 0 -1.5px 0px rgba(0, 0, 0, 0.2)",
    textShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  }
};