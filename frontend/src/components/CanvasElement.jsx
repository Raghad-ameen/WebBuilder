import React from 'react';

export default function CanvasElement({ store, children }) {
  const { state, setState, addItemAtPosition } = store;

  const getCanvasWidth = () => {
    if (state.viewMode === 'mobile') return '375px';
    if (state.viewMode === 'tablet') return '768px';
    return '100%';
  };

  // معالج الإفلات (Drop) والحساب الدقيق للإحداثيات
  const handleMouseUp = (e) => {
    // إذا لم نكن في حالة سحب، لا نفعل شيئاً
    if (!state.isDraggingNow) return;

    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // مراعاة الـ Scale في الموبايل والتابلت
    const scale = state.viewMode === 'desktop' ? 1 : (state.viewMode === 'mobile' ? 0.8 : 0.7);
    
    // حساب الإحداثيات بالنسبة لزاوية الكانفاس (0,0)
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    addItemAtPosition(state.draggingType, x, y);
    
    // إنهاء حالة السحب
    setState(prev => ({ ...prev, isDraggingNow: false, draggingType: null }));
  };

  const handleCanvasClick = (e) => {
    // إلغاء تحديد العناصر عند الضغط على المساحة الفارغة في الكانفاس
    if (e.target.id === 'main-canvas' && (state.selectedElementIds?.length > 0)) {
      store.selectItems([]); 
    }
  };

  return (
    <div 
      id="canvas-wrapper"
      style={{
        flex: 1,
        backgroundColor: '#f3f4f6', // خلفية المحرر الخارجية
        display: 'flex',
        justifyContent: "center", 
        alignItems: 'flex-start',
        minHeight: '100vh',
        position: 'relative',
        overflowY: 'auto',
        padding: '40px 0'
    }}>
      <div 
        id="main-canvas" 
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{ 
            width: getCanvasWidth(), 
            minHeight: "100vh", 
            backgroundColor: "white", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            position: "relative", 
            zIndex: 1,
            overflow: "visible", 
            transition: "width 0.3s ease, transform 0.3s ease",
            // ضمان أن الـ Scale لا يحرك الكانفاس من مكانه
            transformOrigin: 'top center',
            transform: state.viewMode === 'desktop' ? 'none' : `scale(${state.viewMode === 'mobile' ? 0.8 : 0.7})`
        }}
      >
        {children}
        
        {/* دليل بصري عند السحب فوق الكانفاس */}
        {state.isDraggingNow && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(79, 70, 229, 0.05)',
            border: '2px dashed #4f46e5',
            pointerEvents: 'none',
            zIndex: 9999
          }} />
        )}
      </div>
    </div>
  );
}