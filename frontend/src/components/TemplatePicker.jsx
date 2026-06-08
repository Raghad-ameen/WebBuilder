import React from "react";

export default function TemplatePicker({
  templates,
  onSelect,
  onClose
}) {
  return (
    <div style={overlay}>
      <div style={modal}>
        
        <h2>Select Template</h2>

        <div style={grid}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={card}
              onClick={() => onSelect(template)}
            >
              <h3>{template.name}</h3>
            </div>
          ))}
        </div>

        <button onClick={onClose}>
          Close
        </button>

      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  width: "700px",
  background: "#fff",
  padding: "20px",
  borderRadius: "12px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: "16px"
};

const card = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "10px",
  cursor: "pointer"
};