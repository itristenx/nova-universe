import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useToastStore } from '@/stores/toast';
export const Toast = ({ toast, onRemove }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return (React.createElement("svg", { className: "h-5 w-5 text-green-400", viewBox: "0 0 20 20", fill: "currentColor" },
                    React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" })));
            case 'error':
                return (React.createElement("svg", { className: "h-5 w-5 text-red-400", viewBox: "0 0 20 20", fill: "currentColor" },
                    React.createElement("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" })));
            case 'warning':
                return (React.createElement("svg", { className: "h-5 w-5 text-yellow-400", viewBox: "0 0 20 20", fill: "currentColor" },
                    React.createElement("path", { fillRule: "evenodd", d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z", clipRule: "evenodd" })));
            case 'info':
                return (React.createElement("svg", { className: "h-5 w-5 text-blue-400", viewBox: "0 0 20 20", fill: "currentColor" },
                    React.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z", clipRule: "evenodd" })));
        }
    };
    const getBgColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
        }
    };
    return (React.createElement("div", { className: `rounded-lg border p-4 shadow-sm ${getBgColor()}` },
        React.createElement("div", { className: "flex" },
            React.createElement("div", { className: "flex-shrink-0" }, getIcon()),
            React.createElement("div", { className: "ml-3 flex-1" },
                React.createElement("p", { className: "text-sm font-medium text-gray-900" }, toast.title),
                toast.description && (React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, toast.description))),
            React.createElement("div", { className: "ml-4 flex-shrink-0" },
                React.createElement("button", { className: "inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500", onClick: () => onRemove(toast.id) },
                    React.createElement("span", { className: "sr-only" }, "Close"),
                    React.createElement(XMarkIcon, { className: "h-5 w-5" }))))));
};
export const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0)
        return null;
    return (React.createElement("div", { className: "fixed top-4 right-4 z-50 space-y-2 w-96" }, toasts.map((toast) => (React.createElement(Toast, { key: toast.id, toast: toast, onRemove: onRemove })))));
};
// Connected ToastContainer that uses the store
export const ConnectedToastContainer = () => {
    const { toasts, removeToast } = useToastStore();
    return React.createElement(ToastContainer, { toasts: toasts, onRemove: removeToast });
};
