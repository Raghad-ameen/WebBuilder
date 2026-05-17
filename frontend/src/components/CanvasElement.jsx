import React from 'react';

export default function CanvasElement({ store, children, width, scale }) {
  const { state, addItemAtPosition } = store;

  const handleMouseUp = (e) => {
    if (!state.isDraggingNow) return;

    const canvas = document.getElementById('main-canvas');
    if (!canvas) return;

    let canvasWidth = state.viewMode === 'mobile' ? 375 : (state.viewMode === 'tablet' ? 640 : 1024);
    const centerX = (canvasWidth / 2) - 75;
    const centerY = 100; 

    addItemAtPosition(state.draggingType, centerX, centerY);
  };

  const numericWidth = parseInt(width) || 1024;
  const estimatedHeight = parseInt(state.canvasHeight) || 750;

  return (
    <div 
      id="canvas-wrapper"
      key={state.viewMode}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center', 
        alignItems: 'flex-start',
        position: 'relative',
        height: `${estimatedHeight * scale}px`,
        overflow: 'visible'
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

      <div style={{
        width: `${numericWidth * scale}px`,
        height: `${estimatedHeight * scale}px`,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'visible',
        transition: "width 0.2s ease, height 0.2s ease"
      }}>
        <div 
          id="main-canvas" 
          onMouseUp={handleMouseUp}
          className="main-canvas-area"
          style={{ 
            width: width,
            position: "absolute", 
            top: 0,
            left: '50%',
            zIndex: 1,
            overflow: "visible", 
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out, width 0.2s ease",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}