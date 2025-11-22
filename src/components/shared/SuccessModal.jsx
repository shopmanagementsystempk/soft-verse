import React from 'react';

const SuccessModal = ({ show, title = 'Success', message = '', onClose }) => {
  return (
    <div
      className={`modal fade ${show ? 'show d-block' : ''}`}
      style={{ backgroundColor: show ? 'rgba(0,0,0,0.5)' : 'transparent' }}
      tabIndex={-1}
      role="dialog"
      aria-hidden={!show}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;