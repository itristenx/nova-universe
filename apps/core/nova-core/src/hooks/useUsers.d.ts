import type { User } from '@/types';
export interface UserFilters {
    search?: string;
    role?: string;
    status?: 'active' | 'disabled' | 'all';
}
export interface ExtendedUser extends User {
    twoFactorEnabled?: boolean;
    lastLogin?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export declare const useUsers: (filters?: UserFilters, page?: number, limit?: number) => {
    users: User[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    createUser: (userData: Omit<User, "id">) => Promise<User | null>;
    updateUser: (id: number, userData: Partial<User>) => Promise<User | null>;
    deleteUser: (id: number) => Promise<boolean>;
    toggleUserStatus: (id: number) => Promise<boolean>;
    assignRole: (userId: number, role: string) => Promise<boolean>;
    removeRole: (userId: number, role: string) => Promise<boolean>;
    refetch: () => Promise<void>;
};
//# sourceMappingURL=useUsers.d.ts.map