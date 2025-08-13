import React from 'react';
import './Accordion.css';
interface AccordionItem {
    label: string;
    content: React.ReactNode;
}
interface AccordionProps {
    items: AccordionItem[];
    className?: string;
}
export declare const Accordion: React.FC<AccordionProps>;
export {};
//# sourceMappingURL=Accordion.d.ts.map