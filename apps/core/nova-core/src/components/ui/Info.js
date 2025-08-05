import React from 'react';
export const Info = ({ color = 'info', ...props }) => (React.createElement("svg", { viewBox: "0 0 24 24", width: 24, height: 24, fill: "none", stroke: color === 'info' ? '#2196f3' : 'currentColor', strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props },
    React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
    React.createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
    React.createElement("circle", { cx: "12", cy: "8", r: "1" })));
