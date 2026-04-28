import React from 'react';

export default function CustomModal({ isOpen, title, children, onConfirm, onCancel, confirmText = "OK", isDanger = false, showCancel = true }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.content}>{children}</div>
        <div style={styles.actions}>
          {showCancel && (
            <button onClick={onCancel} style={styles.cancelBtn}>
              Cancel
            </button>
          )}
          <button 
            onClick={onConfirm} 
            style={{...styles.confirmBtn, backgroundColor: isDanger ? '#ef4444' : '#4f46e5'}}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
  },
  modal: {
    background: 'white', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  title: { margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' },
  content: { marginBottom: '24px' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { padding: '8px 16px', border: '1px solid #e2e8f0', background: 'none', borderRadius: '6px', cursor: 'pointer' },
  confirmBtn: { padding: '8px 16px', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }
};