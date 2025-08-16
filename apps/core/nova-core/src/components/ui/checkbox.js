import React from 'react';
export const _Checkbox = ({ label, checked, onChange, disabled = false, className = '', }) => {
    return (React.createElement("div", { className: `flex items-center ${className}` },
        React.createElement("input", { type: "checkbox", checked: checked, onChange: (e) => onChange(e.target.checked), disabled: disabled, "aria-label": label, className: `
          h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ` }),
        React.createElement("label", { className: `ml-2 block text-sm ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}` }, label)));
};
