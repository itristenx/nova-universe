import React from 'react';
import './Select.css';
interface SelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: {
        value: string;
        label: string;
    }[];
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}
export declare const Select: React.FC<SelectProps>;
export {};
//# sourceMappingURL=Select.d.ts.map