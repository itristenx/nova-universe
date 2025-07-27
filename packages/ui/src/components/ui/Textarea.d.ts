import React from 'react';
interface TextareaProps {
    label?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    className?: string;
}
export declare const Textarea: React.FC<TextareaProps>;
export {};
//# sourceMappingURL=Textarea.d.ts.map