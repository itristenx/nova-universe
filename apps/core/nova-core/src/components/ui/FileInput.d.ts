import React from 'react';
interface FileInputProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
}
export declare const FileInput: React.FC<FileInputProps>;
export {};
//# sourceMappingURL=FileInput.d.ts.map
