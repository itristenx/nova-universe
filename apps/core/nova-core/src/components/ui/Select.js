import React from 'react';
import './Select.css';
export const Select = ({ label, value, onChange, options, placeholder = 'Select an option', error, helperText, required = false, disabled = false, className = '', }) => {
    return (React.createElement("div", { className: `space-y-1 ${className}` },
        label && (React.createElement("label", { className: "block text-sm font-medium select-label" },
            label,
            required && React.createElement("span", { className: "text-red-500 ml-1" }, "*"))),
        React.createElement("select", { value: value, onChange: (e) => onChange(e.target.value), disabled: disabled, "aria-label": label || placeholder, className: "select block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm" },
            React.createElement("option", { value: "", disabled: true }, placeholder),
            options.map((option) => (React.createElement("option", { key: option.value, value: option.value }, option.label)))),
        error && (React.createElement("p", { className: "text-sm select-error" }, error)),
        helperText && !error && (React.createElement("p", { className: "text-sm select-helper" }, helperText))));
};
