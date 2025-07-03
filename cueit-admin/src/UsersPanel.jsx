import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from './components/Table.jsx';
import Input from './components/Input.jsx';
import Button from './components/Button.jsx';

export default function UsersPanel({ open }) {
  const [users, setUsers] = useState([]);
  const api = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const res = await axios.get(`${api}/api/users`);
          setUsers(res.data);
        } catch {
          alert('Failed to load users');
        }
      })();
    }
  }, [open, api]);

  const addUser = async () => {
    try {
      const res = await axios.post(`${api}/api/users`, { name: '', email: '' });
      setUsers((prev) => [...prev, { id: res.data.id, name: '', email: '' }]);
    } catch {
      alert('Failed to add user');
    }
  };

  const saveUser = async (u) => {
    try {
      await axios.put(`${api}/api/users/${u.id}`, {
        name: u.name,
        email: u.email,
      });
    } catch {
      alert('Failed to save user');
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${api}/api/users/${id}`);
      setUsers((us) => us.filter((x) => x.id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={addUser}>Add User</Button>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td><Input value={u.name || ''} onChange={(e) => setUsers((us) => us.map((x) => x.id === u.id ? { ...x, name: e.target.value } : x))} className="w-32" /></td>
              <td><Input value={u.email || ''} onChange={(e) => setUsers((us) => us.map((x) => x.id === u.id ? { ...x, email: e.target.value } : x))} className="w-40" /></td>
              <td className="space-x-1">
                <Button onClick={() => saveUser(u)} className="btn-sm">Save</Button>
                <Button onClick={() => deleteUser(u.id)} variant="error" className="btn-sm">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
