import React, { useState, useEffect } from 'react';

export default function CanvasElement({ store, children }) {
  const { state, setState, addItemAtPosition } = store;

  const getCanvasWidth = () => {
    if (state.viewMode === 'mobile') return '375px';
    if (state.viewMode === 'tablet') return '768px';
    return '100%';
  };

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
      {state.isDraggingNow && (
        <div 
          onMouseUp={(e) => {
            const canvasRect = document.getElementById('main-canvas').getBoundingClientRect();
            const x = e.clientX - canvasRect.left;
            const y = e.clientY - canvasRect.top;
            
            addItemAtPosition(state.draggingType, x, y, state.pages.find(p => p.id === state.activePageId)?.sections[0]?.id || null);
            setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
          }}
          style={{
            position: 'fixed', // تغطي كل الشاشة أثناء السحب فقط
            inset: 0,
            zIndex: 99999,
            cursor: 'copy',
            backgroundColor: 'transparent' // شفافة تماماً
          }}
        />
      )}

      <div 
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