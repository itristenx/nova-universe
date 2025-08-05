import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import './Modal.css';
export const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true, }) => {
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };
    return (React.createElement("div", { className: "fixed inset-0 z-50 overflow-y-auto" },
        React.createElement("div", { className: "flex min-h-screen items-center justify-center p-4" },
            React.createElement("div", { className: "fixed inset-0 modal", onClick: onClose }),
            React.createElement("div", { className: `relative w-full ${sizeClasses[size]} modal` },
                React.createElement("div", { className: "flex items-center justify-between p-6 border-b" },
                    React.createElement("h3", { className: "text-lg font-medium modal-title" }, title),
                    showCloseButton && (React.createElement(Button, { variant: "default", size: "sm", onClick: onClose, className: "text-gray-400 hover:text-gray-600" },
                        React.createElement(XMarkIcon, { className: "h-5 w-5" })))),
                React.createElement("div", { className: "p-6 modal-content" }, children)))));
};
