import React, { useEffect } from 'react';
import './Snackbar.css';
export const Snackbar = ({ message, open, onClose, duration = 3000, type = 'info', className = '' }) => {
    useEffect(() => {
        if (!open)
            return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [open, duration, onClose]);
    if (!open)
        return null;
    return (React.createElement("div", { className: `snackbar snackbar--${type} ${className}` }, message));
};
