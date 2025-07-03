import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersPanel({ open }) {
  const [users, setUsers] = useState([]);
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await axios.get(`${api}/api/users`);
          setUsers(res.data);
        } catch (err) {
          alert('Failed to load users');
        }
      })();
    }
  }, [open, api]);

  const addUser = async () => {
    try {
      const res = await axios.post(`${api}/api/users`, { name: '', email: '' });
      setUsers([...users, { id: res.data.id, name: '', email: '' }]);
    } catch (err) {
      alert('Failed to add user');
    }
  };

  const saveUser = async (u) => {
    try {
      await axios.put(`${api}/api/users/${u.id}`, {
        name: u.name,
        email: u.email,
      });
    } catch (err) {
      alert('Failed to save user');
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${api}/api/users/${id}`);
      setUsers((us) => us.filter((x) => x.id !== id));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="overflow-y-auto text-sm h-full">
      <button onClick={addUser} className="mb-2 px-2 py-1 bg-blue-600 rounded">
        Add User
      </button>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="pb-2">Name</th>
            <th className="pb-2">Email</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-gray-700">
              <td className="py-1 pr-2">
                <input
                  type="text"
                  value={u.name || ''}
                  onChange={(e) =>
                    setUsers((us) =>
                      us.map((x) =>
                        x.id === u.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                  className="w-32 px-1 text-black rounded"
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="text"
                  value={u.email || ''}
                  onChange={(e) =>
                    setUsers((us) =>
                      us.map((x) =>
                        x.id === u.id ? { ...x, email: e.target.value } : x
                      )
                    )
                  }
                  className="w-40 px-1 text-black rounded"
                />
              </td>
              <td className="py-1 space-x-1">
                <button
                  onClick={() => saveUser(u)}
                  className="px-2 py-1 bg-blue-600 rounded text-xs"
                >
                  Save
                </button>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-2 py-1 bg-red-600 rounded text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
