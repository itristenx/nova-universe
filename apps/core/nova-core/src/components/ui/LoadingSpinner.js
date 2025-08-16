import React from 'react';
export const _LoadingSpinner = ({ size = 32, color = '#1976d2', ...props }) => (React.createElement("div", { ...props, className: props.className || 'loading-spinner' },
    React.createElement("svg", { width: size, height: size, viewBox: "0 0 50 50" },
        React.createElement("circle", { cx: "25", cy: "25", r: "20", fill: "none", stroke: color, strokeWidth: "5", strokeDasharray: "90,150", strokeLinecap: "round", transform: "rotate(-90 25 25)" },
            React.createElement("animateTransform", { attributeName: "transform", type: "rotate", from: "0 25 25", to: "360 25 25", dur: "1s", repeatCount: "indefinite" })))));
