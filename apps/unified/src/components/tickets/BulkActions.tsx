interface BulkActionsProps {
  selectedCount: number;
  onStatusUpdate: (status: string) => void;
  onAssign: (assigneeId: string) => void;
  onDelete: () => void;
}

export function BulkActions({
  selectedCount,
  onStatusUpdate,
  onAssign,
  onDelete,
}: BulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        onChange={(e) => {
          if (e.target.value) {
            onStatusUpdate(e.target.value);
            e.target.value = '';
          }
        }}
        className="btn btn-secondary btn-sm"
        defaultValue=""
      >
        <option value="" disabled>
          Update Status
        </option>
        <option value="open">Mark as Open</option>
        <option value="pending">Mark as Pending</option>
        <option value="resolved">Mark as Resolved</option>
        <option value="closed">Mark as Closed</option>
      </select>

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
      </select>

      <button onClick={onDelete} className="btn btn-error btn-sm">
        Delete ({selectedCount})
      </button>
    </div>
  );
}
