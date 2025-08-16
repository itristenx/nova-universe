import React, { useRef } from 'react';
import { Button } from './Button';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
export const _FileInput = ({ label, accept, onChange, disabled = false, helperText, error, className = '', }) => {
    const fileInputRef = useRef(null);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
    };
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    return (React.createElement("div", { className: `space-y-1 ${className}` },
        label && (React.createElement("label", { className: "block text-sm font-medium text-gray-700" }, label)),
        React.createElement("div", { className: "flex items-center space-x-3" },
            React.createElement(Button, { variant: "secondary", onClick: handleButtonClick, disabled: disabled, type: "button" },
                React.createElement(CloudArrowUpIcon, { className: "h-4 w-4 mr-2" }),
                "Choose File"),
            React.createElement("input", { ref: fileInputRef, type: "file", accept: accept, onChange: handleFileChange, disabled: disabled, className: "hidden", "aria-label": label })),
        error && React.createElement("p", { className: "text-sm text-red-600" }, error),
        helperText && !error && React.createElement("p", { className: "text-sm text-gray-500" }, helperText)));
};
