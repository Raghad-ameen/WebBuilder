import React from 'react';

// CanvasElement.jsx
// CanvasElement.jsx
export default function CanvasElement({ store, children }) {
  const { state, setState, addItemAtPosition } = store;

  const getCanvasWidth = () => {
    if (state.viewMode === 'mobile') return '375px';
    if (state.viewMode === 'tablet') return '768px';
    return '100%';
  };

  const handleMouseUp = (e) => {
    if (!state.isDraggingNow) return;
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = state.viewMode === 'desktop' ? 1 : (state.viewMode === 'mobile' ? 0.8 : 0.7);
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    addItemAtPosition(state.draggingType, x, y);
    setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
  };

  return (
    <div 
      id="canvas-wrapper"
      style={{
        flex: 1,
        backgroundColor: '#ffffff', // فرض الأبيض هنا
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'flex-start',
        height: '100vh', 
        position: 'relative',
        overflow: 'auto',
        padding: '0'
      }}
    >
      <div 
        id="main-canvas" 
        onMouseUp={handleMouseUp}
        style={{ 
            width: getCanvasWidth(), 
            minHeight: "100vh", 
            backgroundColor: "#ffffff", // فرض الأبيض هنا أيضاً
            boxShadow: "none", // حذف الشادو تماماً
            border: "none", 
            position: "relative", 
            zIndex: 1,
            overflow: "visible", 
            transition: "width 0.3s ease",
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column' 
        }}
      >
        {children}
      </div>
    </div>
  );
}