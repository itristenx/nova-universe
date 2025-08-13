import React from 'react';
import './Switch.css';
export const Switch = ({ checked, onChange, disabled = false, label, className = '', }) => (React.createElement("label", { className: `switch-container ${className}` },
    React.createElement("input", { type: "checkbox", checked: checked, onChange: e => onChange(e.target.checked), disabled: disabled, className: "switch-input" }),
    React.createElement("span", { className: "switch-slider" }),
    label && React.createElement("span", { className: "switch-label" }, label)));
