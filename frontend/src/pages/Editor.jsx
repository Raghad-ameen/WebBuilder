import React, { useEffect, useRef,useMemo } from "react";
import EditorLayout from "../components/EditorLayout";
import { useEditorStore } from "../store/editorStore";
import CustomModal from "../components/CustomModal";

export default function Editor() {
const initialData = useMemo(() => ({
  projectName: "dnd",
  canvasWidth: '100%',
  canvasHeight: '800px',
  canvasStyles: { backgroundColor: '#f3f4f6' }, 
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