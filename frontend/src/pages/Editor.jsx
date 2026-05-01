import React, { useEffect, useRef,useMemo } from "react";
import EditorLayout from "../components/EditorLayout";
import { useEditorStore } from "../store/editorStore";
import CustomModal from "../components/CustomModal";
import TopBar from "../components/TopBar"; // تأكدي أن المسار يؤدي لملف التوب بار فعلاً

export default function Editor() {
const initialData = useMemo(() => ({
  projectName: "dnd",
  // canvasWidth: '100%',
  // canvasHeight: '800px',
  viewMode: 'desktop',
canvasStyles: { backgroundColor: '#ffffff' }, 
 pages: [{ id: "p1", name: "Home", sections: [] }],
  activePageId: "p1",
  selectedElementIds: [],
}), []);

  const store = useEditorStore(initialData);

  const storeRef = useRef(store);
const selectedRef = useRef(store.state.selectedElementIds); 
  storeRef.current = store;
selectedRef.current = store.state.selectedElementIds; 
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isSelectable = e.target.closest(".selectable-item");
      const isMoveableControl = e.target.closest(".moveable-control-box"); 
      const isPanel = e.target.closest(".editor-sidebar") || 
                      e.target.closest(".properties-panel") || 
                      e.target.closest(".editor-toolbar") ||
                      e.target.closest(".color-picker-container"); 

      if (!isSelectable && !isPanel && !isMoveableControl) {
        if (selectedRef.current.length > 0) {
          storeRef.current.selectItems([]); 
        }
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []); 

  useEffect(() => {
    const savedData = localStorage.getItem(`project_${store.state.projectName}`);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        store.setState(parsedData);
      } catch (e) {
        console.error("Error loading saved project", e);
      }
    }
  }, []);

 useEffect(() => {
 const handleKeyDown = (e) => {
  const s = storeRef.current;
  if (!s) return;

  const isCtrl = e.ctrlKey || e.metaKey;
  const code = e.code;

  const activeEl = document.activeElement;
  const isWriting = 
    activeEl.isContentEditable || 
    activeEl.tagName === 'INPUT' || 
    activeEl.tagName === 'TEXTAREA' ||
    e.target.closest('[contenteditable="true"]');

  if (isCtrl && code === 'KeyZ') {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      s.redo();
    } else {
      s.undo();
    }
    return; 
  }

  if (isCtrl && code === 'KeyY') {
    e.preventDefault();
    e.stopPropagation();
    s.redo();
    return;
  }

  if (code === 'Backspace' || code === 'Delete') {
    if (isWriting) {
      return; 
    } else {
      const selectedIds = s.state.selectedElementIds || s.state.selected || [];
      if (selectedIds.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        selectedIds.forEach(id => s.deleteElement(id));
      }
    }
  }

  if (isCtrl && !isWriting) {
    const selectedIds = s.state.selectedElementIds || s.state.selected || [];
    if (code === 'KeyC') { e.preventDefault(); s.copyElements(selectedIds); }
    if (code === 'KeyV') { e.preventDefault(); s.pasteElements(); }
    if (code === 'KeyX') { e.preventDefault(); s.cutElements(selectedIds); }
  }
};
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
}, []);

// دالة تحويل الستايلات من كائن إلى نص CSS
  const formatStyle = (styles) => {
    if (!styles) return "";
    return Object.entries(styles)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}:${value}`;
      })
      .join(";");
  };

  // دالة التصدير الأساسية
  const exportToHTML = () => {
    const BASE_WIDTH = 1200;
    const currentState = store.state;
    const activePage = currentState.pages.find(p => p.id === currentState.activePageId);

    if (!activePage) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Project</title>
    <style>
        body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; }
        .section { position: relative; width: 100%; overflow: hidden; background-size: cover; background-position: center; }
        .element { position: absolute; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
        @media (max-width: 1024px) {
            .section { height: auto !important; display: flex; flex-direction: column; padding: 40px 20px; }
            .element { position: relative !important; left: 0 !important; width: 100% !important; top: auto !important; margin-bottom: 20px; transform: none !important; }
        }
    </style>
</head>
<body>
    ${activePage.sections.map(sec => `
        <div class="section" style="height: ${sec.height}px; ${formatStyle(sec.styles)}">
            ${(sec.data?.items || []).map(item => `
                <div class="element" style="
                    left: ${(item.x / BASE_WIDTH) * 100}%; 
                    top: ${item.y}px; 
                    width: ${(item.width / BASE_WIDTH) * 100}%; 
                    height: ${item.height}px;
                    ${formatStyle(item.styles)}
                ">
                    ${item.type === 'text' ? item.text : ''}
                    ${item.type === 'image' ? `<img src="${item.src}" style="width:100%; height:100%; object-fit:cover;">` : ''}
                    ${item.type === 'button' ? `<button style="width:100%; height:100%; cursor:pointer;">${item.text}</button>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentState.projectName || 'my-site'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
   
      <EditorLayout store={store} />

      <CustomModal
        isOpen={store.state.modal.isOpen && store.state.modal.type === "confirmClear"}
        title="Clear Canvas"
        confirmText="Clear"
        isDanger={true}
        onCancel={store.closeModal}
        onConfirm={() => {
          store.clearCanvas();
          store.closeModal();
        }}
      >
        <p style={{ color: '#64748b', lineHeight: '1.5' }}>
          Are you sure you want to remove all elements from this page? 
        </p>
      </CustomModal>
    </>
  );
}