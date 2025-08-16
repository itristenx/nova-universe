import React from 'react';
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  color?: string;
}
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 32,
  color = '#1976d2',
  ...props
}) => (
  <div {...props} className={props.className || 'loading-spinner'}>
    <svg width={size} height={size} viewBox="0 0 50 50">
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray="90,150"
        strokeLinecap="round"
        transform="rotate(-90 25 25)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
);
