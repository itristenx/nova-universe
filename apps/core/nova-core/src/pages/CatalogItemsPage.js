import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Modal } from '@heroui/react';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
export const CatalogItemsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', formSchema: '{}' });
    const { addToast } = useToastStore();
    useEffect(() => {
        load();
    }, []);
    const load = async () => {
        try {
            setLoading(true);
            const data = await api.getCatalogItems();
            setItems(data);
        }
        catch (e) {
            console.error('Failed to load catalog', e);
            addToast({ type: 'error', title: 'Error', description: 'Failed to load catalog items' });
        }
        finally {
            setLoading(false);
        }
    };
    const createItem = async () => {
        try {
            const parsed = JSON.parse(formData.formSchema || '{}');
            const newItem = await api.createCatalogItem({ name: formData.name, formSchema: parsed });
            setItems([...items, newItem]);
            setShowModal(false);
            setFormData({ name: '', formSchema: '{}' });
            addToast({ type: 'success', title: 'Success', description: 'Catalog item created' });
        }
        catch (e) {
            console.error('Failed', e);
            addToast({ type: 'error', title: 'Error', description: 'Failed to create item' });
        }
    };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex justify-between items-start" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Catalog Items")),
            React.createElement(Button, { variant: "primary", onClick: () => setShowModal(true) }, "Add Item")),
        React.createElement(Card, null, loading ? (React.createElement("div", { className: "p-4" }, "Loading...")) : (React.createElement("ul", { className: "p-4 space-y-2" }, items.map(i => (React.createElement("li", { key: i.id, className: "border p-2 rounded" }, i.name)))))),
        React.createElement(Modal, { isOpen: showModal, onClose: () => setShowModal(false), title: "New Catalog Item", size: "md" },
            React.createElement("div", { className: "space-y-4" },
                React.createElement(Input, { label: "Name", value: formData.name, onChange: e => setFormData({ ...formData, name: e.target.value }) }),
                React.createElement(Input, { label: "Form Schema (JSON)", value: formData.formSchema, onChange: e => setFormData({ ...formData, formSchema: e.target.value }) }),
                React.createElement(Button, { variant: "primary", onClick: createItem }, "Create")))));
};
