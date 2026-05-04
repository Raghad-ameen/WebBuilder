import React from 'react';

export default function CanvasElement({ store, children }) {
  const { state, setState, addItemAtPosition } = store;
  const canvasBg = state.canvasBg || "#ffffff";

  const getCanvasConfig = () => {
    switch (state.viewMode) {
      case 'mobile': return { width: '375px', scale: 0.8 };
      case 'tablet': return { width: '768px', scale: 0.7 };
      default: return { width: '100%', scale: 1 };
    }
  };

  const { width, scale } = getCanvasConfig();


const handleMouseUp = (e) => {
  if (!state.isDraggingNow) return;

  const canvas = document.getElementById('main-canvas');
  if (!canvas) return;

  let canvasWidth;
  if (state.viewMode === 'mobile') canvasWidth = 375;
  else if (state.viewMode === 'tablet') canvasWidth = 768;
  else canvasWidth = canvas.offsetWidth; 

  const centerX = (canvasWidth / 2) - 75;
  
  const centerY = 100; 


  addItemAtPosition(state.draggingType, centerX, centerY);
  
  setState(prev => ({ 
    ...prev, 
    isDraggingNow: false, 
    draggingType: null 
  }));
};

return (
    <div 
      id="canvas-wrapper"
      key={state.viewMode}
      style={{
        flex: 1,
        backgroundColor: 'transparent' ,
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'flex-start',
        minHeight: '100vh', 
        position: 'relative',
        overflow: 'auto',
        padding: state.viewMode === 'desktop' ? '0' : '40px 0',
      }}
    >
      {state.isDraggingNow && (
        <div 
          onMouseUp={handleMouseUp}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            cursor: 'copy',
            backgroundColor: 'transparent'
          }}
        />
      )}

      <div 
        id="main-canvas" 
        onMouseUp={handleMouseUp}
        className="main-canvas-area"
        style={{ 
            width: width, 
            minHeight: "100vh", 
            backgroundColor: canvasBg,
            boxShadow: state.viewMode === 'desktop' ? "none" : "0 10px 50px rgba(0,0,0,0.1)", 
            position: "relative", 
            zIndex: 1,
            overflow: "visible", 
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
}