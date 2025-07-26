import React, { useState } from 'react';
import './Accordion.css';

interface AccordionItem {
  label: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({ items, className = '' }) => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className={`accordion ${className}`}>
      {items.map((item, i) => (
        <div key={item.label} className="accordion-item">
          <button className="accordion-label" onClick={() => setOpen(open === i ? null : i)}>
            {item.label}
          </button>
          {open === i && <div className="accordion-content">{item.content}</div>}
        </div>
      ))}
    </div>
  );
};
