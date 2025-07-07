import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { api } from '@/lib/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { token } = await api.login({ email, password });
      const user = await api.me();
      
      localStorage.setItem('auth_token', token);
      login(token, user);
      
      addToast({
        type: 'success',
        title: 'Login successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorTitle = 'Login failed';
      let errorDescription = 'Please check your credentials and try again.';
      
      // Handle different types of errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorTitle = 'Connection failed';
        errorDescription = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        errorTitle = 'Invalid credentials';
        errorDescription = 'The email or password you entered is incorrect. Please try again.';
      } else if (error.response?.status === 429) {
        errorTitle = 'Too many attempts';
        errorDescription = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.response?.status >= 500) {
        errorTitle = 'Server error';
        errorDescription = 'The server is experiencing issues. Please try again later.';
      }
      
      addToast({
        type: 'error',
        title: errorTitle,
        description: errorDescription,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            <img
              className="h-12 w-12"
              src="/logo.png"
              alt="CueIT"
              onError={(e) => {
                e.currentTarget.src = '/vite.svg';
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sign in to CueIT Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your kiosks, users, and support tickets
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={!email || !password}
            >
              Sign in
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
