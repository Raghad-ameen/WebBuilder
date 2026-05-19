import React from "react";
import JSZip from "jszip"; // استيراد المكتبة لعمل ملف الـ ZIP
import { 
  Undo2, Redo2, Monitor, Tablet, Smartphone, Save, 
  ChevronRight, Eye, EyeOff, Download, Trash2
} from "lucide-react";

export default function TopBar({ store, onSave }) {
  if (!store) return null;

  const { state, setViewMode, undo, redo, history, redoStack } = store;
  const activePage = state.pages?.find(p => p.id === state.activePageId);

  const canUndo = history && history.length > 0;
  const canRedo = redoStack && redoStack.length > 0;

  // دالة تصدير المشروع كمجلد فرونت اند متكامل
  const handleExportProject = async () => {
    if (!activePage) return;

    const zip = new JSZip();

    // دالة مساعدة لتحويل الـ Style Object الخاص بـ React إلى ستايل CSS قياسي
    const objectToCss = (stylesObj) => {
      if (!stylesObj) return "";
      return Object.entries(stylesObj)
        .map(([key, value]) => {
          const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          return `${kebabKey}: ${value};`;
        })
        .join(" ");
    };

    let htmlElements = "";
    let cssRules = "";

    // 1. معالجة وتوليد أكواد السكاشن والعناصر
    activePage.sections?.forEach((section, sIndex) => {
      const sectionClassName = `section-${section.id}`;
      let sectionElementsHtml = "";

      // الأنماط الخاصة بالسكشن نفسه
      const isHiddenContainer = section.id.includes("hidden") || section.type === "custom-blank";
      const sectionStyles = {
        position: "relative",
        width: "100%",
        minHeight: `${section.height || 400}px`,
        overflow: "hidden",
        ...(isHiddenContainer ? { backgroundColor: "transparent", border: "none" } : section.styles)
      };

      cssRules += `/* Style for Section ${sIndex + 1} (${section.type}) */\n`;
      cssRules += `.${sectionClassName} {\n  ${objectToCss(sectionStyles).replace(/; /g, ";\n  ")}\n}\n\n`;

      // الأنماط والعناصر الحرة بداخل السكشن
      section.data?.items?.forEach((item, iIndex) => {
        const itemClassName = `element-${item.id}`;
        const itemStyles = {
          position: "absolute",
          left: `${item.x}px`,
          top: `${item.y}px`,
          width: `${item.width}px`,
          height: `${item.height}px`,
          ...item.styles
        };

        cssRules += `.${itemClassName} {\n  ${objectToCss(itemStyles).replace(/; /g, ";\n  ")}\n}\n\n`;

        // توليد وسم الـ HTML المناسب بناءً على نوع العنصر
        if (item.type === "input") {
          sectionElementsHtml += `        <input type="text" class="${itemClassName}" placeholder="${item.text || 'Enter text...'}" />\n`;
        } else if (item.type === "image") {
          sectionElementsHtml += `        <img src="${item.url || 'https://via.placeholder.com/' + item.width + 'x' + item.height}" alt="Image" class="${itemClassName}" />\n`;
        } else if (item.type === "button") {
          sectionElementsHtml += `        <button class="${itemClassName}">${item.text || 'Button'}</button>\n`;
        } else {
          sectionElementsHtml += `        <div class="${itemClassName}">${item.text || ''}</div>\n`;
        }
      });

      htmlElements += `    \n`;
      htmlElements += `    <section class="${sectionClassName}">\n${sectionElementsHtml}    </section>\n\n`;
    });

    // 2. بناء كود HTML النظيف المستقل (index.html)
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.projectName || 'Exported Project'} - ${activePage.name}</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

${htmlElements}
    <script src="js/script.js"></script>
</body>
</html>`;

    // 3. بناء كود الـ CSS العام (styles.css)
    const baseCssContent = `/* Global Reset & Base Styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: ${state.canvasStyles?.backgroundColor || "#ffffff"};
    overflow-x: hidden;
}

${cssRules}`;

    // 4. بناء كود الـ JS التفاعلي الفارغ (script.js)
    const jsContent = `// JS Document for ${state.projectName || 'Project'}
document.addEventListener("DOMContentLoaded", () => {
    console.log("Frontend project loaded successfully!");
    // يمكنك كتابة أكواد التفاعل أو الـ Event Listeners هنا
});`;

    // 5. حزم وتوزيع الملفات داخل بنية المجلدات في الـ ZIP
    zip.file("index.html", htmlContent); // ملف الـ HTML الرئيسي في الجَذر
    
    const cssFolder = zip.folder("css"); // مجلد خاص بالـ CSS
    cssFolder.file("styles.css", baseCssContent);
    
    const jsFolder = zip.folder("js"); // مجلد خاص بالـ JavaScript
    jsFolder.file("script.js", jsContent);

    // 6. توليد ملف الـ ZIP وتنزيله للمستخدم فوراً
    try {
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      
      // اسم المجلد المضغوط سيكون متوافقاً مع اسم المشروع الحالي
      const folderName = `${state.projectName || 'project'}-frontend`.toLowerCase().replace(/\s+/g, '-');
      downloadLink.download = `${folderName}.zip`;
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate ZIP project:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        {/* أزرار الـ Undo و Redo والـ Viewport Switcher كما هي */}
        <div style={styles.buttonGroup}>
          <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ ...styles.iconButton, opacity: canUndo ? 1 : 0.3, cursor: canUndo ? 'pointer' : 'not-allowed' }}><Undo2 size={15} /></button>
          <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)" style={{ ...styles.iconButton, opacity: canRedo ? 1 : 0.3, cursor: canRedo ? 'pointer' : 'not-allowed' }}><Redo2 size={15} /></button>
        </div>
        <div style={styles.divider} />
        <div style={styles.viewportSwitcher}>
          {['desktop', 'tablet', 'mobile'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ ...styles.modeBtn, background: state.viewMode === mode ? '#fff' : 'transparent', boxShadow: state.viewMode === mode ? '0 1px 3px rgba(0,0,0,0.06)' : 'none', color: state.viewMode === mode ? '#4f46e5' : '#64748b' }}>
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
        <button onClick={() => store.openModal("confirmClear")} style={styles.clearBtn} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.borderColor = '#fca5a5'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#fee2e2'; }}><Trash2 size={13} />Clear Page</button>
        
        <button onClick={store.togglePreview} style={{ ...styles.previewBtn, background: state.isPreviewMode ? "#10b981" : "#fff", color: state.isPreviewMode ? "#fff" : "#0f172a", border: state.isPreviewMode ? "1px solid #10b981" : "1px solid #e2e8f0" }} onMouseEnter={(e) => { if(!state.isPreviewMode) e.currentTarget.style.backgroundColor = '#f8fafc'; }} onMouseLeave={(e) => { if(!state.isPreviewMode) e.currentTarget.style.backgroundColor = '#fff'; }} >
          {state.isPreviewMode ? <EyeOff size={13} /> : <Eye size={13} />}
          {state.isPreviewMode ? "Exit Preview" : "Live Preview"}
        </button>

        {/* زر التصدير الاحترافي الجديد كلياً */}
        <button 
          onClick={handleExportProject}
          style={styles.exportBtn}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(224, 231, 255, 0.6)'}
        >
          <Download size={13} />
          Export Code
        </button>

        <button onClick={() => { if (store.saveProject) store.saveProject(); if (typeof onSave === 'function') { onSave(); } }} style={styles.saveButton} onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #4338ca 0%, #3730a3 100%)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'; }}><Save size={13} />Save</button>
      </div>
    </div>
  );
}

// الأنماط الخاصة بك تظل كما هي تحت
const styles = {
  container: { height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", zIndex: 1000 },
  section: { display: "flex", alignItems: "center", gap: "6px", flex: 1 },
  sectionRight: { display: "flex", alignItems: "center", gap: "6px", flex: 1, justifyContent: "flex-end" },
  buttonGroup: { display: "flex", gap: "1px" },
  iconButton: { background: "transparent", border: "none", padding: "6px", cursor: "pointer", borderRadius: "6px", display: "flex", color: "#475569", transition: "0.2s" },
  divider: { width: "1px", height: "20px", background: "#e2e8f0", margin: "0 6px" },
  viewportSwitcher: { display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', gap: '1px' },
  modeBtn: { border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.15s all' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', padding: '5px 12px', borderRadius: '20px', border: '1px solid #f1f5f9', flexShrink: 0 },
  projectName: { fontSize: '12px', color: '#64748b', fontWeight: '500' },
  pageName: { fontSize: '12px', color: '#1e293b', fontWeight: '600' },
  clearBtn: { display: 'flex', alignItems: 'center', gap: '4px', height: '31px', padding: '0 10px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: 'all 0.15s' },
  previewBtn: { display: "flex", alignItems: "center", gap: "4px", height: "31px", padding: "0 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", transition: "all 0.15s" },
  exportBtn: { height: "31px", padding: "0 10px", backgroundColor: "rgba(224, 231, 255, 0.6)", color: "#4f46e5", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", whiteSpace: "nowrap", transition: "all 0.15s" },
  saveButton: { background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)", border: "1px solid #4338ca", color: "white", height: "31px", padding: "0 14px", borderRadius: "6px", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 1.5px 4px rgba(79, 70, 229, 0.2), inset 0 -1.5px 0px rgba(0, 0, 0, 0.2)", textShadow: "0 1px 1px rgba(0, 0, 0, 0.1)", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }
};