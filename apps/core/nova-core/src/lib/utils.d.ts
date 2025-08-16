import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatDate(date: string | Date): string;
export declare function formatRelativeTime(date: string | Date): string;
export declare function getUrgencyColor(urgency: string): string;
export declare function getStatusColor(status: string): string;
export declare function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void;
export declare function downloadFile(data: Blob, filename: string): void;
export declare function generateRandomString(length: number): string;
export declare function validateEmail(email: string): boolean;
export declare function capitalizeFirst(str: string): string;
//# sourceMappingURL=utils.d.ts.map
