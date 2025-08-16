import React from 'react';
export const _FormControlLabel = ({ control, label, ...props }) => (React.createElement("label", { ...props, className: props.className || 'form-control-label' },
    control,
    React.createElement("span", { className: "form-control-label-text" }, label)));
