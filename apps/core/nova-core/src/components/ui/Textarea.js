import React from 'react';
export const _Textarea = ({ label, value, onChange, placeholder, error, helperText, required = false, disabled = false, rows = 4, className = '', }) => {
    return (React.createElement("div", { className: `space-y-1 ${className}` },
        label && (React.createElement("label", { className: "block text-sm font-medium text-gray-700" },
            label,
            required && React.createElement("span", { className: "text-red-500 ml-1" }, "*"))),
        React.createElement("textarea", { value: value, onChange: onChange, placeholder: placeholder, required: required, disabled: disabled, rows: rows, className: `
          block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 sm:text-sm resize-vertical
          ${error
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
        ` }),
        error && React.createElement("p", { className: "text-sm text-red-600" }, error),
        helperText && !error && React.createElement("p", { className: "text-sm text-gray-500" }, helperText)));
};
