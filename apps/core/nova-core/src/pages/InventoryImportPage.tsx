import React, { useState } from 'react';
import { Button, Card, FileInput } from '@/components/ui';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';

export const InventoryImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { addToast } = useToastStore();

  const handleImport = async () => {
    if (!file) return;
    try {
      await api.importInventory(file);
      addToast({ type: 'success', title: 'Success', description: 'Import completed' });
      setFile(null);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', description: 'Import failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Inventory</h1>
      </div>
      <Card className="p-6 space-y-4">
        <FileInput accept=".csv" onChange={setFile} />
        <Button variant="primary" onClick={handleImport} disabled={!file}>Import</Button>
      </Card>
    </div>
  );
};
