import React, { useEffect, useRef } from "react";
import EditorLayout from "../components/EditorLayout";
import { useEditorStore } from "../store/editorStore";
import CustomModal from "../components/CustomModal";

export default function Editor() {
  const store = useEditorStore({
    projectName: "dnd",
    canvasWidth: '100%',
    canvasHeight: '800px',
    pages: [
      {
        id: "p1",
        name: "Home",
        sections: [],
      },
    ],
    activePageId: "p1",
    selected: [],
  });

  // مراجع ثابتة للوصول لأحدث البيانات داخل الـ Listeners
  const storeRef = useRef(store);
  const selectedRef = useRef(store.state.selected);

  // تحديث المراجع في كل رندرة (مهم جداً لعمل الكيبورد)
  storeRef.current = store;
  selectedRef.current = store.state.selected;

  // --- 1. التعامل مع النقر خارج العناصر ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      const isSelectable = e.target.closest(".selectable-item");
      const isMoveableControl = e.target.closest(".moveable-control-box"); // أضيفي هذا السطر
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

  // --- 2. استعادة البيانات من الـ LocalStorage ---
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

  // --- 3. التعامل مع اختصارات الكيبورد (الإصلاح النهائي) ---
  useEffect(() => {
   const handleKeyDown = (e) => {
  const s = storeRef.current;
  const isInput = e.target.tagName === 'INPUT' || 
                  e.target.tagName === 'TEXTAREA' || 
                  e.target.isContentEditable ||
                  e.target.closest('.properties-panel');

  const isCtrl = e.ctrlKey || e.metaKey;
  
  // نستخدم e.code بدلاً من e.key للأزرار الأساسية
  const code = e.code; 

  // 1. التراجع (Undo) - سيعمل سواء كانت اللغة عربي أو إنجليزي
  if (isCtrl && code === 'KeyZ' && !e.shiftKey) {
    if (!isInput) {
      e.preventDefault();
      e.stopPropagation();
      s.undo();
    }
  }

  // 2. الإعادة (Redo)
  if (isCtrl && (code === 'KeyY' || (code === 'KeyZ' && e.shiftKey))) {
    if (!isInput) {
      e.preventDefault();
      e.stopPropagation();
      s.redo();
    }
  }

  // 3. الحذف (Delete و Backspace لا يتغيران باللغة عادةً، لكن للأمان:)
  if ((code === 'Delete' || code === 'Backspace') && !isInput) {
    if (s.state.selected.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      s.state.selected.forEach(id => s.deleteElement(id));
    }
  }

  // 4. النسخ والقص ولصق
  if (isCtrl && !isInput) {
    if (code === 'KeyC') { e.preventDefault(); s.copyElements(s.state.selected); }
    if (code === 'KeyV') { e.preventDefault(); s.pasteElements(); }
    if (code === 'KeyX') { e.preventDefault(); s.cutElements(s.state.selected); }
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