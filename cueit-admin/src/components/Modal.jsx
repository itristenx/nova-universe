import React from 'react';
import Button from './Button.jsx';

export default function Modal({ open, onClose, title, children }) {
  return (
    <div className={`modal ${open ? 'modal-open' : ''}`}>
      <div className="modal-box">
        {title && <h3 className="font-bold text-lg mb-4">{title}</h3>}
        {children}
        <div className="modal-action">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
