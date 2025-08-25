import { QrCodeIcon } from '@heroicons/react/24/outline';
import { useAssetStore } from '@stores/assets';

interface BulkAssetActionsProps {
  selectedCount: number;
  onAssign: (userId: string) => void;
  onRelocate: (locationId: string) => void;
  onStatusChange: (status: 'active' | 'inactive' | 'maintenance' | 'retired') => void;
  onGenerateQRCodes: () => void;
}

export function BulkAssetActions({
  selectedCount,
  onAssign,
  onRelocate,
  onStatusChange,
  onGenerateQRCodes,
}: BulkAssetActionsProps) {
  const { locations } = useAssetStore();

  return (
    <div className="flex items-center gap-2">
      <select
        onChange={(e) => {
          if (e.target.value) {
            onAssign(e.target.value);
            e.target.value = '';
          }
        }}
        className="btn btn-secondary btn-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Assign To
        </option>
        <option value="unassign">Unassign</option>
        <option value="user1">John Doe</option>
        <option value="user2">Jane Smith</option>
        <option value="user3">Bob Johnson</option>
      </select>

      <select
        onChange={(e) => {
          if (e.target.value) {
            onRelocate(e.target.value);
            e.target.value = '';
          }
        }}
        className="btn btn-secondary btn-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Move To
        </option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => {
          if (e.target.value) {
            onStatusChange(e.target.value as 'active' | 'inactive' | 'maintenance' | 'retired');
            e.target.value = '';
          }
        }}
        className="btn btn-secondary btn-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Change Status
        </option>
        <option value="active">Mark as Active</option>
        <option value="inactive">Mark as Inactive</option>
        <option value="maintenance">Mark for Maintenance</option>
        <option value="retired">Mark as Retired</option>
      </select>

      <button onClick={onGenerateQRCodes} className="btn btn-secondary btn-sm">
        <QrCodeIcon className="h-4 w-4" />
        QR Codes ({selectedCount})
      </button>
    </div>
  );
}
