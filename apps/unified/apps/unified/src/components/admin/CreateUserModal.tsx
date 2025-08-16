import type { User } from '@/types'

interface CreateUserModalProps {
  onClose: () => void
  onUserCreate: (user: User) => void
}

export function CreateUserModal({ onClose, onUserCreate }: CreateUserModalProps) {
  const handleSubmit = () => {
    const newUser: User = {
      id: Date.now().toString(),
      email: 'newuser@company.com',
      firstName: 'New',
      lastName: 'User',
      isActive: true,
      roles: [{ id: '3', name: 'user', description: 'End User' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onUserCreate(newUser)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold">Create New User</h3>
        <p className="mb-6 text-gray-600 dark:text-gray-400">User creation form placeholder</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary">Create</button>
        </div>
      </div>
    </div>
  )
}
