import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Checkbox } from '@heroui/react';
import { UsersIcon, PlusIcon, TrashIcon, PencilIcon, UserGroupIcon, MagnifyingGlassIcon, PowerIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToastStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roles: [],
        permissions: [],
    });
    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);
    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        }
        catch (error) {
            console.error('Failed to load users:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to load users',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const loadRoles = async () => {
        try {
            const data = await api.getRoles();
            setRoles(data);
        }
        catch (error) {
            console.error('Failed to load roles:', error);
        }
    };
    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            roles: [],
            permissions: [],
        });
    };
    const handleCreateUser = async () => {
        try {
            const newUser = await api.createUser({
                name: formData.name,
                email: formData.email,
                roles: formData.roles,
                permissions: formData.permissions,
            });
            setUsers([...users, newUser]);
            setShowCreateModal(false);
            resetForm();
            addToast({
                type: 'success',
                title: 'Success',
                description: 'User created successfully',
            });
        }
        catch (error) {
            console.error('Failed to create user:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to create user',
            });
        }
    };
    const handleUpdateUser = async () => {
        if (!editingUser)
            return;
        try {
            await api.updateUser(editingUser.id, {
                name: formData.name,
                email: formData.email,
                roles: formData.roles,
                ...(formData.password && { password: formData.password }),
            });
            setUsers(users.map(u => u.id === editingUser.id ? {
                ...u,
                name: formData.name,
                email: formData.email,
                roles: formData.roles
            } : u));
            setEditingUser(null);
            resetForm();
            addToast({
                type: 'success',
                title: 'Success',
                description: 'User updated successfully',
            });
        }
        catch (error) {
            console.error('Failed to update user:', error);
            addToast({
                type: 'error',
                title: 'Error',
                description: 'Failed to update user',
            });
        }
    };
    const deleteUser = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await api.deleteUser(id);
                setUsers(users.filter(u => u.id !== id));
                addToast({
                    type: 'success',
                    title: 'Success',
                    description: 'User deleted successfully',
                });
            }
            catch (error) {
                console.error('Failed to delete user:', error);
                addToast({
                    type: 'error',
                    title: 'Error',
                    description: error.response?.data?.error || 'Failed to delete user. Please try again.',
                });
            }
        }
    };
    const toggleUserStatus = async (user) => {
        const action = user.disabled ? 'enable' : 'disable';
        if (confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                await api.updateUser(user.id, {
                    disabled: !user.disabled
                });
                setUsers(users.map(u => u.id === user.id ? { ...u, disabled: !user.disabled } : u));
                addToast({
                    type: 'success',
                    title: 'Success',
                    description: `User ${action}d successfully`,
                });
            }
            catch (error) {
                console.error(`Failed to ${action} user:`, error);
                addToast({
                    type: 'error',
                    title: 'Error',
                    description: error.response?.data?.error || `Failed to ${action} user. Please try again.`,
                });
            }
        }
    };
    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            roles: user.roles || [],
            permissions: user.permissions || [],
        });
    };
    const closeModals = () => {
        setShowCreateModal(false);
        setEditingUser(null);
        resetForm();
    };
    const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-start" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "User Management"),
                React.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Manage user accounts, roles, and permissions")),
            React.createElement(Button, { variant: "primary", onClick: () => setShowCreateModal(true) },
                React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                "Add User")),
        React.createElement(Card, null,
            React.createElement("div", { className: "p-4" },
                React.createElement("div", { className: "relative" },
                    React.createElement(MagnifyingGlassIcon, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
                    React.createElement(Input, { placeholder: "Search users by name or email...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })))),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-blue-500" },
                        React.createElement(UsersIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Total Users"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, users.length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-green-500" },
                        React.createElement(UserGroupIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Admins"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, users.filter(u => u.roles?.includes('admin')).length)))),
            React.createElement(Card, null,
                React.createElement("div", { className: "flex items-center" },
                    React.createElement("div", { className: "p-3 rounded-lg bg-purple-500" },
                        React.createElement(UsersIcon, { className: "h-6 w-6 text-white" })),
                    React.createElement("div", { className: "ml-4" },
                        React.createElement("p", { className: "text-sm font-medium text-gray-600" }, "Regular Users"),
                        React.createElement("p", { className: "text-2xl font-semibold text-gray-900" }, users.filter(u => !u.roles?.includes('admin')).length))))),
        React.createElement(Card, null, loading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
            React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" }))) : filteredUsers.length === 0 ? (React.createElement("div", { className: "text-center py-12" },
            React.createElement(UsersIcon, { className: "mx-auto h-12 w-12 text-gray-400" }),
            React.createElement("h3", { className: "mt-2 text-sm font-medium text-gray-900" }, searchTerm ? 'No users found' : 'No users found'),
            React.createElement("p", { className: "mt-1 text-sm text-gray-500" }, searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first user account.'),
            !searchTerm && (React.createElement("div", { className: "mt-6" },
                React.createElement(Button, { variant: "primary", onClick: () => setShowCreateModal(true) },
                    React.createElement(PlusIcon, { className: "h-4 w-4 mr-2" }),
                    "Add User"))))) : (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "min-w-full divide-y divide-gray-200" },
                React.createElement("thead", { className: "bg-gray-50" },
                    React.createElement("tr", null,
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "User"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Email"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Status"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Roles"),
                        React.createElement("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Permissions"),
                        React.createElement("th", { className: "relative px-6 py-3" },
                            React.createElement("span", { className: "sr-only" }, "Actions")))),
                React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, filteredUsers.map((user) => (React.createElement("tr", { key: user.id, className: `hover:bg-gray-50 ${user.disabled ? 'opacity-60' : ''}` },
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", { className: "flex items-center" },
                            React.createElement("div", { className: `h-8 w-8 rounded-full flex items-center justify-center ${user.disabled ? 'bg-gray-400' : 'bg-primary-600'}` },
                                React.createElement("span", { className: "text-sm font-medium text-white" }, user.name?.charAt(0)?.toUpperCase() || 'U')),
                            React.createElement("div", { className: "ml-3" },
                                React.createElement("div", { className: "text-sm font-medium text-gray-900" },
                                    user.name,
                                    user.isDefault && (React.createElement("span", { className: "ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" }, "Default")))))),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900" }, user.email),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.disabled
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'}` }, user.disabled ? 'Disabled' : 'Active')),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", { className: "flex flex-wrap gap-1" }, user.roles?.map((role) => (React.createElement("span", { key: role, className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" }, role))) || (React.createElement("span", { className: "text-sm text-gray-500" }, "No roles assigned")))),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap" },
                        React.createElement("div", { className: "text-sm text-gray-900" },
                            user.permissions?.length || 0,
                            " permissions")),
                    React.createElement("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" },
                        React.createElement(Button, { variant: "default", size: "sm", onClick: () => openEditModal(user), className: "text-blue-600 hover:text-blue-900" },
                            React.createElement(PencilIcon, { className: "h-4 w-4" })),
                        !user.isDefault && (React.createElement(Button, { variant: "default", size: "sm", onClick: () => toggleUserStatus(user), className: user.disabled ? "text-green-600 hover:text-green-900" : "text-orange-600 hover:text-orange-900", title: user.disabled ? "Enable user" : "Disable user" },
                            React.createElement(PowerIcon, { className: "h-4 w-4" }))),
                        !user.isDefault && (React.createElement(Button, { variant: "default", size: "sm", onClick: () => deleteUser(user.id), className: "text-red-600 hover:text-red-900" },
                            React.createElement(TrashIcon, { className: "h-4 w-4" })))))))))))),
        React.createElement(Modal, { isOpen: showCreateModal, onClose: closeModals, title: "Create New User", size: "md" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Enter user name", required: true }),
                React.createElement(Input, { label: "Email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "Enter email address", required: true }),
                React.createElement(Input, { label: "Password", type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), placeholder: "Enter password", required: true }),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700" }, "Roles"),
                    React.createElement("div", { className: "space-y-2" }, roles.map((role) => (React.createElement(Checkbox, { key: role.id, label: role.name, checked: formData.roles.includes(role.name), onChange: (checked) => {
                            if (checked) {
                                setFormData({ ...formData, roles: [...formData.roles, role.name] });
                            }
                            else {
                                setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.name) });
                            }
                        } })))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: handleCreateUser, disabled: !formData.name || !formData.email || !formData.password }, "Create User"))),
        React.createElement(Modal, { isOpen: !!editingUser, onClose: closeModals, title: `Edit User: ${editingUser?.name}`, size: "md" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), required: true }),
                React.createElement(Input, { label: "Email", type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), required: true }),
                React.createElement(Input, { label: "Password", type: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), placeholder: "Leave blank to keep current password" }),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700" }, "Roles"),
                    React.createElement("div", { className: "space-y-2" }, roles.map((role) => (React.createElement(Checkbox, { key: role.id, label: role.name, checked: formData.roles.includes(role.name), onChange: (checked) => {
                            if (checked) {
                                setFormData({ ...formData, roles: [...formData.roles, role.name] });
                            }
                            else {
                                setFormData({ ...formData, roles: formData.roles.filter(r => r !== role.name) });
                            }
                        } })))))),
            React.createElement("div", { className: "flex justify-end space-x-3 mt-6" },
                React.createElement(Button, { variant: "secondary", onClick: closeModals }, "Cancel"),
                React.createElement(Button, { variant: "primary", onClick: handleUpdateUser, disabled: !formData.name || !formData.email }, "Save Changes")))));
};
