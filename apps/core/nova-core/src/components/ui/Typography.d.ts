import React from 'react';
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
    component?: React.ElementType;
    color?: string;
}
export declare const Typography: React.FC<TypographyProps>;
//# sourceMappingURL=Typography.d.ts.map