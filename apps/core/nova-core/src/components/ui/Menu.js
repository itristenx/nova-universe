import React, { useState, useRef, useEffect } from 'react';
import './Menu.css';
export const Menu = ({ items, buttonLabel, className = '' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        if (open)
            document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);
    return (React.createElement("div", { className: `menu ${className}`, ref: ref },
        React.createElement("button", { className: "menu-btn", onClick: () => setOpen(v => !v) }, buttonLabel),
        open && (React.createElement("div", { className: "menu-list" }, items.map(item => (React.createElement("button", { key: item.label, className: "menu-item", onClick: () => { item.onClick(); setOpen(false); } }, item.label)))))));
};
