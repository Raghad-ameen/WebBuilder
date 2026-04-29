import React from 'react';

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

  const handleCanvasClick = (e) => {
    if (e.target.id === 'main-canvas' && (state.selectedElementIds?.length > 0)) {
      store.selectItems([]); 
    }
  };


 // CanvasElement.jsx المعدل
// CanvasElement.jsx
return (
  <div 
    id="canvas-wrapper"
    style={{
      flex: 1,
      backgroundColor: '#f1f5f9', 
      display: 'flex',
      justifyContent: 'center', // تم التصحيح هنا
      alignItems: 'flex-start',  // تم التصحيح هنا
      height: '100vh', 
      position: 'relative',
      overflow: 'auto', 
      padding: '0'
    }}
  >
    <div 
      id="main-canvas" 
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      style={{ 
          width: getCanvasWidth(), 
          minHeight: "100vh", 
          backgroundColor: "white", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)", 
          position: "relative", 
          zIndex: 1,
          overflow: "visible", 
          transition: "all 0.3s ease",
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column' 
      }}
    >
      {children}
      
      {state.isDraggingNow && (
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid #4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.05)',
          pointerEvents: 'none',
          zIndex: 9999
        }} />
      )}
    </div>
  </div>
);
}