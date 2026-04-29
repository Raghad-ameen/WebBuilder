import React from 'react';


export default function CanvasElement({ store, children }) {
  const { state, setState, addItemAtPosition } = store;

  // دالة لجلب العرض بناءً على المود الحالي
  const getCanvasWidth = () => {
    switch (state.viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const handleMouseUp = (e) => {
    if (!state.isDraggingNow) return;
    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // الحسابات بناءً على السكيل (مهم جداً للـ DND)
    const scale = state.viewMode === 'desktop' ? 1 : (state.viewMode === 'mobile' ? 0.8 : 0.7);
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    addItemAtPosition(state.draggingType, x, y);
    setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
  };

  return (
    <div 
      id="canvas-wrapper"
      key={state.viewMode} // 👈 هذا السطر سيجبر المكون على التحديث فوراً
      style={{
        flex: 1,
        backgroundColor: state.viewMode === 'desktop' ? '#ffffff' : '#f1f5f9', // أبيض في الديسكتوب، رمادي خفيف في الباقي
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'flex-start',
        height: '100vh', 
        position: 'relative',
        overflow: 'auto',
        padding: state.viewMode === 'desktop' ? '0' : '40px 0',
        transition: 'background-color 0.3s ease'
      }}
    >
      <div 
        id="main-canvas" 
        onMouseUp={handleMouseUp}
        style={{ 
            width: getCanvasWidth(), 
            minHeight: "100vh", 
            backgroundColor: "#ffffff",
            boxShadow: state.viewMode === 'desktop' ? "none" : "0 10px 50px rgba(0,0,0,0.1)", 
            position: "relative", 
            zIndex: 1,
            overflow: "visible", 
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // أنيميشن ناعم جداً
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            border: state.viewMode === 'desktop' ? "none" : "1px solid #e2e8f0"
        }}
      >
        {children}
      </div>
    </div>
  );
}