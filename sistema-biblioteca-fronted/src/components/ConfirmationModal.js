// src/components/ConfirmationModal.js
import React from 'react';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirmación</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="confirm" onClick={onConfirm}>Confirmar</button>
          <button className="cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;