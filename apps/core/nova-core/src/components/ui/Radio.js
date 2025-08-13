import React from 'react';
import './Radio.css';
export const Radio = ({ label, value, onChange, options, disabled = false, error, helperText, className = '', }) => (React.createElement("div", { className: `radio-container ${className}` },
    label && React.createElement("span", { className: "radio-label" }, label),
    React.createElement("div", { className: "radio-group" }, options.map(option => (React.createElement("label", { key: option.value, className: "radio-option" },
        React.createElement("input", { type: "radio", value: option.value, checked: value === option.value, onChange: () => onChange(option.value), disabled: disabled, className: "radio-input" }),
        React.createElement("span", { className: "radio-custom" }),
        React.createElement("span", { className: "radio-text" }, option.label))))),
    error && React.createElement("p", { className: "radio-error" }, error),
    helperText && !error && React.createElement("p", { className: "radio-helper" }, helperText)));
