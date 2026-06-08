import { useRef } from "react";

export default function DraggablePopup({ children, onClose }) {
  const ref = useRef(null);
  const pos = useRef({ x: 200, y: 100 });

  const onMouseDown = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;

    const startLeft = pos.current.x;
    const startTop = pos.current.y;

    const onMouseMove = (moveEvent) => {
      pos.current.x = startLeft + (moveEvent.clientX - startX);
      pos.current.y = startTop + (moveEvent.clientY - startY);

      if (ref.current) {
        ref.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "320px",
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        zIndex: 999999
      }}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        style={{
          padding: "10px",
          background: "#f1f5f9",
          cursor: "grab",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <span>Form</span>

        <button onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "12px" }}>
        {children}
      </div>
    </div>
  );
}