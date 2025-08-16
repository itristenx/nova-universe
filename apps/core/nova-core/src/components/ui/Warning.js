import React from 'react';
export const _Warning = ({ color = 'warning', ...props }) => (React.createElement("svg", { viewBox: "0 0 24 24", width: 24, height: 24, fill: "none", stroke: color === 'warning' ? '#ff9800' : 'currentColor', strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props },
    React.createElement("polygon", { points: "12 2 2 22 22 22 12 2" }),
    React.createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
    React.createElement("circle", { cx: "12", cy: "19", r: "1" })));
