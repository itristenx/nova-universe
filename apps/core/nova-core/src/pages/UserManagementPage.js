import { Button, Card, Checkbox, Input, Modal } from '@heroui/react';
import { useUsers } from '@/hooks/useUsers';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import { MagnifyingGlassIcon, PencilIcon, PlusIcon, ShieldCheckIcon, TrashIcon, UserMinusIcon, UserPlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
const UserTable = ({ users, loading, onEdit, onDelete, onToggleStatus, onAssignRole }) => {
    if (loading) {
        return (React.createElement("div", { className: "animate-pulse" },
            React.createElement("div", { className: "space-y-2" }, [...Array(5)].map((_, i) => (React.createElement("div", { key: i, className: "h-16 bg-gray-200 rounded" }))))));
    }
    if (users.length === 0) {
        return (React.createElement("div", { className: "text-center py-12" },
            React.createElement(UsersIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
            React.createElement("h3", { className: "mt-2 text-sm font-medium text-gray-900" }, "No users found"),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Get started by creating a new user.")));
    }
    return (React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
            React.createElement("thead", { className: "bg-gray-50" },
                React.createElement("tr", null,
                    React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "User"),
                    React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Email"),
                    React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Roles"),
                    React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Status"),
                    React.createElement("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Actions"))),
            React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, users.map((user) => (React.createElement("tr", { key: user.id, className: "hover:bg-gray-50" },
                React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                    React.createElement("div", { className: "flex items-center" },
                        React.createElement("div", { className: "flex-shrink-0 h-10 w-10" },
                            React.createElement("div", { className: "h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center" },
                                React.createElement("span", { className: "text-white text-sm font-medium" }, user.name?.charAt(0)?.toUpperCase() || 'U'))),
                        React.createElement("div", { className: "ml-4" },
                            React.createElement("div", { className: "text-sm font-medium text-gray-900" }, user.name),
                            React.createElement("div", { className: "text-sm text-gray-500" },
                                "ID: ",
                                user.id)))),
                React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                    React.createElement("div", { className: "text-sm text-gray-900" }, user.email)),
                React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                    React.createElement("div", { className: "flex flex-wrap gap-1" }, user.roles?.map((role) => (React.createElement("span", { key: role, className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" }, role))) || (React.createElement("span", { className: "text-sm text-gray-500 italic" }, "No roles assigned")))),
                React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                    React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.disabled
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'}` }, user.disabled ? 'Disabled' : 'Active')),
                React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" },
                    React.createElement("div", { className: "flex items-center justify-end space-x-2" },
                        React.createElement("button", { onClick: () => onEdit(user), className: "text-indigo-600 hover:text-indigo-900 p-1 rounded", title: "Edit user", "aria-label": `Edit user ${user.name}` },
                            React.createElement(PencilIcon, { className: "h-4 w-4" })),
                        React.createElement("button", { onClick: () => onAssignRole(user), className: "text-blue-600 hover:text-blue-900 p-1 rounded", title: "Manage roles", "aria-label": `Manage roles for ${user.name}` },
                            React.createElement(ShieldCheckIcon, { className: "h-4 w-4" })),
                        React.createElement("button", { onClick: () => onToggleStatus(user), className: `p-1 rounded ${user.disabled
                                ? 'text-green-600 hover:text-green-900'
                                : 'text-yellow-600 hover:text-yellow-900'}`, title: user.disabled ? 'Enable user' : 'Disable user', "aria-label": `${user.disabled ? 'Enable' : 'Disable'} user ${user.name}` }, user.disabled ? React.createElement(UserPlusIcon, { className: "h-4 w-4" }) : React.createElement(UserMinusIcon, { className: "h-4 w-4" })),
                        React.createElement("button", { onClick: () => onDelete(user), className: "text-red-600 hover:text-red-900 p-1 rounded", title: "Delete user", "aria-label": `Delete user ${user.name}` },
                            React.createElement(TrashIcon, { className: "h-4 w-4" })))))))))));
};
const FilterBar = ({ filters, onFiltersChange }) => {
    const availableRoles = ['admin', 'user', 'moderator', 'viewer'];
    return (React.createElement("div", { className: "bg-white p-4 border-b border-gray-200" },
        React.createElement("div", { className: "flex flex-col sm:flex-row gap-4" },
            React.createElement("div", { className: "flex-1" },
                React.createElement("div", { className: "relative" },
                    React.createElement(MagnifyingGlassIcon, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
                    React.createElement("input", { type: "text", placeholder: "Search users by name or email...", value: filters.search || '', onChange: (e) => onFiltersChange({ ...filters, search: e.target.value }), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent", "aria-label": "Search users" }))),
            React.createElement("div", { className: "sm:w-40" },
                React.createElement("select", { value: filters.role || 'all', onChange: (e) => onFiltersChange({ ...filters, role: e.target.value === 'all' ? undefined : e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent", "aria-label": "Filter by role" },
                    React.createElement("option", { value: "all" }, "All Roles"),
                    availableRoles.map(role => (React.createElement("option", { key: role, value: role }, role))))),
            React.createElement("div", { className: "sm:w-40" },
                React.createElement("select", { value: filters.status || 'all', onChange: (e) => onFiltersChange({
                        ...filters,
                        status: e.target.value === 'all' ? undefined : e.target.value
                    }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent", "aria-label": "Filter by status" },
                    React.createElement("option", { value: "all" }, "All Status"),
                    React.createElement("option", { value: "active" }, "Active"),
                    React.createElement("option", { value: "disabled" }, "Disabled"))))));
};
const Pagination = ({ currentPage, totalPages, total, limit, onPageChange }) => {
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);
    if (totalPages <= 1)
        return null;
    return (React.createElement("div", { className: "bg-white px-4 py-3 border-t border-gray-200 sm:px-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", { className: "flex-1 flex justify-between sm:hidden" },
                React.createElement("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage <= 1, className: "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" }, "Previous"),
                React.createElement("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage >= totalPages, className: "ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" }, "Next")),
            React.createElement("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-700" },
                        "Showing ",
                        React.createElement("span", { className: "font-medium" }, startItem),
                        " to",
                        ' ',
                        React.createElement("span", { className: "font-medium" }, endItem),
                        " of",
                        ' ',
                        React.createElement("span", { className: "font-medium" }, total),
                        " results")),
                React.createElement("div", null,
                    React.createElement("nav", { className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px", "aria-label": "Pagination" },
                        React.createElement("button", { onClick: () => onPageChange(currentPage - 1), disabled: currentPage <= 1, className: "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Go to previous page" }, "Previous"),
                        [...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            return (React.createElement("button", { key: page, onClick: () => onPageChange(page), className: `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`, "aria-label": `Go to page ${page}`, "aria-current": page === currentPage ? 'page' : undefined }, page));
                        }),
                        React.createElement("button", { onClick: () => onPageChange(currentPage + 1), disabled: currentPage >= totalPages, className: "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", "aria-label": "Go to next page" }, "Next")))))));
};
export const UserManagementPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});
    const pageSize = 10;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [roleUser, setRoleUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: [],
    });
    const [roles, setRoles] = useState([]);
    const { addToast } = useToastStore();
    const { users, loading, error, total, totalPages, createUser, updateUser, deleteUser, toggleUserStatus } = useUsers(filters, currentPage, pageSize);
    const isFormValid = (data, requirePassword = false) => {
        if (!data.name || !data.email)
            return false;
        if (requirePassword && !data.password)
            return false;
        return true;
    };
    useEffect(() => {
        api.getRoles().then(setRoles).catch((e) => {
            console.error('Failed to load roles:', e);
            addToast({
                type: 'error',
                message: 'Failed to load roles. Please try again later.',
            });
        });
    }, []);
    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', roles: [] });
    };
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            roles: user.roles || [],
        });
    };
    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
            const success = await deleteUser(user.id);
            if (success) {
                addToast({ type: 'success', title: 'Deleted', description: 'User deleted successfully' });
            }
            else {
                addToast({ type: 'error', title: 'Error', description: 'Failed to delete user' });
            }
        }
    };
    const handleToggleStatus = async (user) => {
        const success = await toggleUserStatus(user.id);
        if (success) {
            addToast({ type: 'success', title: 'Updated', description: `User ${user.disabled ? 'enabled' : 'disabled'} successfully` });
        }
        else {
            addToast({ type: 'error', title: 'Error', description: 'Failed to update user status' });
        }
    };
    const handleAssignRole = (user) => {
        setRoleUser(user);
        setFormData({ name: '', email: '', password: '', roles: user.roles || [] });
    };
    const handleCreateUser = () => {
        setShowCreateModal(true);
    };
    const submitCreateUser = async () => {
        const newUser = await createUser({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roles: formData.roles,
        });
        if (newUser) {
            addToast({ type: 'success', title: 'User Created', description: 'User created successfully' });
            setShowCreateModal(false);
            resetForm();
        }
        else {
            addToast({ type: 'error', title: 'Error', description: 'Failed to create user' });
        }
    };
    const submitUpdateUser = async () => {
        if (!editingUser)
            return;
        const updated = await updateUser(editingUser.id, {
            name: formData.name,
            email: formData.email,
            roles: formData.roles,
            ...(formData.password ? { password: formData.password } : {}),
        });
        if (updated) {
            addToast({ type: 'success', title: 'Updated', description: 'User updated successfully' });
            setEditingUser(null);
            resetForm();
        }
        else {
            addToast({ type: 'error', title: 'Error', description: 'Failed to update user' });
        }
    };
    const saveRoles = async () => {
        if (!roleUser)
            return;
        const updated = await updateUser(roleUser.id, { roles: formData.roles });
        if (updated) {
            addToast({ type: 'success', title: 'Roles Updated', description: 'Roles updated successfully' });
            setRoleUser(null);
            resetForm();
        }
        else {
            addToast({ type: 'error', title: 'Error', description: 'Failed to update roles' });
        }
    };
    const closeModals = () => {
        setShowCreateModal(false);
        setEditingUser(null);
        setRoleUser(null);
        resetForm();
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900 flex items-center" },
                    React.createElement(UsersIcon, { className: "h-8 w-8 mr-3 text-indigo-600" }),
                    "User Management"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Manage user accounts, roles, and permissions across Nova Universe")),
            React.createElement("button", { onClick: handleCreateUser, className: "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" },
                React.createElement(PlusIcon, { className: "h-5 w-5 mr-2" }),
                "Add User")),
        error && (React.createElement("div", { className: "bg-red-50 border border-red-200 rounded-md p-4" },
            React.createElement("div", { className: "flex" },
                React.createElement("div", { className: "ml-3" },
                    React.createElement("h3", { className: "text-sm font-medium text-red-800" }, "Error"),
                    React.createElement("div", { className: "mt-2 text-sm text-red-700" }, error))))),
        React.createElement(Card, { className: "overflow-hidden" },
            React.createElement(FilterBar, { filters: filters, onFiltersChange: setFilters }),
            React.createElement(UserTable, { users: users, loading: loading, onEdit: handleEdit, onDelete: handleDelete, onToggleStatus: handleToggleStatus, onAssignRole: handleAssignRole }),
            React.createElement(Pagination, { currentPage: currentPage, totalPages: totalPages, total: total, limit: pageSize, onPageChange: setCurrentPage })),
        React.createElement(Modal, { isOpen: showCreateModal, onClose: closeModals, title: "Create User" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true }),
                React.createElement(Input, { label: "Email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true }),
                React.createElement(Input, { label: "Password", type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), required: true }),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700" }, "Roles"),
                    React.createElement("div", { className: "space-y-2" }, roles.map((role) => (React.createElement(Checkbox, { key: role.id, label: role.name, checked: formData.roles.includes(role.name), onChange: (checked) => {
                            if (checked) {
                                setFormData({ ...formData, roles: [...formData.roles, role.name] });
                            }
                            else {
                                setFormData({ ...formData, roles: formData.roles.filter((r) => r !== role.name) });
                            }
                        } })))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: submitCreateUser, disabled: !isFormValid(formData, true) }, "Create"))),
        React.createElement(Modal, { isOpen: !!editingUser, onClose: closeModals, title: editingUser ? `Edit ${editingUser.name}` : 'Edit User' },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true }),
                React.createElement(Input, { label: "Email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true }),
                React.createElement(Input, { label: "Password", type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), placeholder: "Leave blank to keep current" }),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700" }, "Roles"),
                    React.createElement("div", { className: "space-y-2" }, roles.map((role) => (React.createElement(Checkbox, { key: role.id, label: role.name, checked: formData.roles.includes(role.name), onChange: (checked) => {
                            if (checked) {
                                setFormData({ ...formData, roles: [...formData.roles, role.name] });
                            }
                            else {
                                setFormData({ ...formData, roles: formData.roles.filter((r) => r !== role.name) });
                            }
                        } })))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: submitUpdateUser, disabled: !formData.name || !formData.email }, "Save"))),
        React.createElement(Modal, { isOpen: !!roleUser, onClose: closeModals, title: roleUser ? `Roles for ${roleUser.name}` : 'Assign Roles' },
            React.createElement("div", { className: "space-y-4" }, roles.map((role) => (React.createElement(Checkbox, { key: role.id, label: role.name, checked: formData.roles.includes(role.name), onChange: (checked) => {
                    if (checked) {
                        setFormData({ ...formData, roles: [...formData.roles, role.name] });
                    }
                    else {
                        setFormData({ ...formData, roles: formData.roles.filter((r) => r !== role.name) });
                    }
                } })))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: saveRoles }, "Save")))));
};
