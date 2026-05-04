import React from 'react';

const EditableText = ({ initialValue, onSave }) => {
  return (
    <span 
      contentEditable={true}
      suppressContentEditableWarning={true}
      onBlur={(e) => {
        const updatedText = e.target.innerText;
        onSave(updatedText); 
      }}
      className="focus:outline-none focus:ring-2 focus:ring-blue-400 p-1 rounded inline-block min-w-5"
    >
      {initialValue}
    </span>
  );
};

export default EditableText;