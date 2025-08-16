import React, { useState } from 'react';
import './Accordion.css';
export const Accordion = ({ items, className = '' }) => {
  const [open, setOpen] = useState(null);
  return React.createElement(
    'div',
    { className: `accordion ${className}` },
    items.map((item, i) =>
      React.createElement(
        'div',
        { key: item.label, className: 'accordion-item' },
        React.createElement(
          'button',
          { className: 'accordion-label', onClick: () => setOpen(open === i ? null : i) },
          item.label,
        ),
        open === i && React.createElement('div', { className: 'accordion-content' }, item.content),
      ),
    ),
  );
};
