import type { Ticket } from '@/types'

interface UpdateTicketModalProps {
  ticket: Ticket
  onClose: () => void
  onUpdate: () => void
}

export function UpdateTicketModal({ ticket, onClose, onUpdate }: UpdateTicketModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Update Ticket
        </h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Ticket update form will be implemented here
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onUpdate} className="btn btn-primary">
            Update
          </button>
        </div>
      </div>
    </div>
  )
}