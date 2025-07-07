import React, { useState } from 'react';
import axios from 'axios';
import { colors } from './theme.js';

export default function LoginPage({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const api = import.meta.env.VITE_API_URL;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${api}/api/login`, { email, password });
      onSuccess(res.data.token);
    } catch {
      setError('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded space-y-4 w-80">
        <h1 className="text-xl mb-2 text-center">Admin Login</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded text-black"
          required
        />
        <button
          type="submit"
          style={{ backgroundColor: colors.primary }}
          className="w-full py-2 rounded mt-2"
        >
          Login
        </button>
      </form>
    </div>
  );
}
