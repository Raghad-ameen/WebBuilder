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
  // أضيفي هذا السطر هنا
  canvasStyles: { backgroundColor: '#f3f4f6' }, 
  pages: [{ id: "p1", name: "Home", sections: [] }],
  activePageId: "p1",
  selected: [],
}), []);

  const store = useEditorStore(initialData);

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
    if (!s) return;

    // 1. تحديد ما إذا كان المستخدم في وضع "إدخال" أو "تعديل نص"
    const isInput = 
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA' || 
      e.target.isContentEditable || 
      e.target.closest('[contenteditable="true"]') || 
      e.target.closest('.properties-panel');

    const isCtrl = e.ctrlKey || e.metaKey;
    const code = e.code; 

    // 2. حماية وضع الكتابة: إذا كان المستخدم يكتب، نوقف اختصاراتنا (ما عدا التراجع)
    if (isInput) {
      // نسمح باختصارات التراجع/الإعادة الافتراضية للمتصفح داخل النصوص
      if (isCtrl && (code === 'KeyZ' || code === 'KeyY')) {
        return; 
      }
      // أي زر آخر (مثل Backspace) يجب أن يؤدي وظيفته الطبيعية داخل النص ولا يحذف العنصر
      return; 
    }

    // --- الاختصارات العالمية (تعمل فقط عندما لا نكون في وضع كتابة) ---

    // 1. التراجع (Undo)
    if (isCtrl && code === 'KeyZ' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof s.undo === 'function') s.undo();
    }

    // 2. الإعادة (Redo)
    if (isCtrl && (code === 'KeyY' || (code === 'KeyZ' && e.shiftKey))) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof s.redo === 'function') s.redo();
    }

    // 3. الحذف (Delete و Backspace)
    if (code === 'Delete' || code === 'Backspace') {
      // نتحقق من وجود عناصر محددة (استخدمي المسمى الموجود في الستور لديكِ)
      const selectedIds = s.state.selectedElementIds || s.state.selected || [];
      if (selectedIds.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        selectedIds.forEach(id => s.deleteElement(id));
      }
    }

    // 4. النسخ والقص واللصق
    if (isCtrl) {
      const selectedIds = s.state.selectedElementIds || s.state.selected || [];
      
      if (code === 'KeyC') { 
        e.preventDefault(); 
        if (s.copyElements) s.copyElements(selectedIds); 
      }
      if (code === 'KeyX') { 
        e.preventDefault(); 
        if (s.cutElements) s.cutElements(selectedIds); 
      }
      if (code === 'KeyV') { 
        e.preventDefault(); 
        if (s.pasteElements) s.pasteElements(); 
      }
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