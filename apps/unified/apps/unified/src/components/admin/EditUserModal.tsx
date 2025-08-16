import type { User } from '@/types'

interface EditUserModalProps {
  user: User
  onClose: () => void
  onUserUpdate: (user: User) => void
}

export function EditUserModal({ user, onClose, onUserUpdate }: EditUserModalProps) {
  const handleSubmit = () => {
    onUserUpdate({ ...user, updatedAt: new Date().toISOString() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Edit User</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">User edit form placeholder</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">Update</button>
        </div>
      </div>
    </div>
  )
}
