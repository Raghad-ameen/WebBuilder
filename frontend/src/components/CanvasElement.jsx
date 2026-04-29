import React, { useState, useEffect } from 'react';

export default function CanvasElement({ store, children }) {
  const { state, setState, addItemAtPosition } = store;

  const getCanvasWidth = () => {
    if (state.viewMode === 'mobile') return '375px';
    if (state.viewMode === 'tablet') return '768px';
    return '100%';
  };
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (state.isDraggingNow) {
        setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [state.isDraggingNow, setState]);

  return (
    <div style={{
        flex: 1,
        backgroundColor: 'transparent', // إلغاء الرمادي نهائياً
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        position: 'relative',
    }}>
      {/* طبقة الحماية - تظهر وتختفي بذكاء */}
{/* طبقة الحماية - تظهر فقط وقت السحب */}
{state.isDraggingNow && (
  <div 
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999, // أعلى من كل شيء
      backgroundColor: 'rgba(0,0,0,0.02)', // لون خفيف جداً للتأكد أنها تعمل
      cursor: 'copy'
    }}
    onMouseUp={(e) => {
      const canvas = document.getElementById('main-canvas-area');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // الحساب مع مراعاة الـ Scale
const scale = state.viewMode === 'desktop' ? 1 : (state.viewMode === 'mobile' ? 0.8 : 0.7);      
            const x = (e.clientX - rect.left) / scale;
            const y = (e.clientY - rect.top) / scale;
                  
      const activePage = state.pages.find(p => p.id === state.activePageId);
      const targetSectionId = activePage?.sections?.[0]?.id || null;

      addItemAtPosition(state.draggingType, x, y, targetSectionId);
      
      // إنهاء الحالة فوراً
      setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
    }}
  />
)}      <div 
        id="main-canvas"
        style={{ 
            width: getCanvasWidth(), 
            minHeight: "100vh", 
            backgroundColor: "white", 
            margin: "0 auto",
            position: "relative", 
            // boxShadow: "0 0 20px rgba(0,0,0,0.05)", // اختيارية، تعطي عمق بسيط للكانفاس
            zIndex: 1,
            overflow: "visible", 
        }}
      >
        {children}
      </div>
    </div>
  );
}