import React from 'react';
import './Radio.css';
interface RadioProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: {
        value: string;
        label: string;
    }[];
    disabled?: boolean;
    error?: string;
    helperText?: string;
    className?: string;
}
export declare const Radio: React.FC<RadioProps>;
export {};
//# sourceMappingURL=Radio.d.ts.map