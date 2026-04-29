import React, { useEffect, useRef,useMemo } from "react";
import EditorLayout from "../components/EditorLayout";
import { useEditorStore } from "../store/editorStore";
import CustomModal from "../components/CustomModal";

export default function Editor() {
  // استخدام useMemo يمنع إعادة إنشاء الستور في كل حركة ماوس
  // داخل Editor.jsx
const initialData = useMemo(() => ({
  projectName: "dnd",
  canvasWidth: '100%',
  canvasHeight: '800px',
  canvasStyles: { backgroundColor: '#f3f4f6' }, 
  pages: [{ id: "p1", name: "Home", sections: [] }],
  activePageId: "p1",
  selectedElementIds: [], // تغييره من selected إلى selectedElementIds
}), []);

  const store = useEditorStore(initialData);

  // مراجع ثابتة للوصول لأحدث البيانات داخل الـ Listeners
  const storeRef = useRef(store);
const selectedRef = useRef(store.state.selectedElementIds); // تعديل هنا
  // تحديث المراجع في كل رندرة (مهم جداً لعمل الكيبورد)
  storeRef.current = store;
selectedRef.current = store.state.selectedElementIds; // وتعديل هنا
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
  if (!s) return;

  const isCtrl = e.ctrlKey || e.metaKey;
  const code = e.code;

  // 1. فحص فوري وحاسم لوضع الكتابة
  const activeEl = document.activeElement;
  const isWriting = 
    activeEl.isContentEditable || 
    activeEl.tagName === 'INPUT' || 
    activeEl.tagName === 'TEXTAREA' ||
    e.target.closest('[contenteditable="true"]');

  // 2. معالجة الـ Undo/Redo أولاً وقبل كل شيء (أولوية قصوى)
  if (isCtrl && code === 'KeyZ') {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      s.redo();
    } else {
      s.undo();
    }
    return; // اخرج فوراً بعد التنفيذ
  }

  if (isCtrl && code === 'KeyY') {
    e.preventDefault();
    e.stopPropagation();
    s.redo();
    return;
  }

  // 3. منع الحذف إذا كنا في وضع الكتابة
  if (code === 'Backspace' || code === 'Delete') {
    if (isWriting) {
      return; // اترك المتصفح يمسح الحروف فقط
    } else {
      // إذا لم نكن نكتب، احذف العنصر المختار
      const selectedIds = s.state.selectedElementIds || s.state.selected || [];
      if (selectedIds.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        selectedIds.forEach(id => s.deleteElement(id));
      }
    }
  }

  // 4. النسخ واللصق (فقط إذا لم نكن نكتب)
  if (isCtrl && !isWriting) {
    const selectedIds = s.state.selectedElementIds || s.state.selected || [];
    if (code === 'KeyC') { e.preventDefault(); s.copyElements(selectedIds); }
    if (code === 'KeyV') { e.preventDefault(); s.pasteElements(); }
    if (code === 'KeyX') { e.preventDefault(); s.cutElements(selectedIds); }
  }
};
  // استخدام capture: true لضمان التقاط الحدث قبل أي معالجات أخرى
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