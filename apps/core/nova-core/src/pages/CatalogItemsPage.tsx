import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Modal } from '@/components/ui';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { RequestCatalogItem } from '@/types';

export const CatalogItemsPage: React.FC = () => {
  const [items, setItems] = useState<RequestCatalogItem[]>([]);
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
    } catch (e) {
      console.error('Failed to load catalog', e);
      addToast({ type: 'error', title: 'Error', description: 'Failed to load catalog items' });
    } finally {
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
    } catch (e) {
      console.error('Failed', e);
      addToast({ type: 'error', title: 'Error', description: 'Failed to create item' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalog Items</h1>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Item
        </Button>
      </div>
      <Card>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <ul className="space-y-2 p-4">
            {items.map((i) => (
              <li key={i.id} className="rounded border p-2">
                {i.name}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Catalog Item"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Form Schema (JSON)"
            value={formData.formSchema}
            onChange={(e) => setFormData({ ...formData, formSchema: e.target.value })}
          />
          <Button variant="primary" onClick={createItem}>
            Create
          </Button>
        </div>
      </Modal>
    </div>
  );
};
