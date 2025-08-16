import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@heroui/react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
const KnowledgeListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isEditor =
    userRoles.includes('admin') ||
    userRoles.includes('superadmin') ||
    userRoles.includes('kb_editor');
  useEffect(() => {
    loadArticles();
  }, [search]);
  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeArticles({ search });
      setArticles(data);
    } finally {
      setLoading(false);
    }
  };
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement(
        'h1',
        { className: 'text-2xl font-bold text-gray-900' },
        'Knowledge Base',
      ),
      isEditor &&
        React.createElement(
          Button,
          { variant: 'primary', onClick: () => navigate('/knowledge/new') },
          'New Article',
        ),
    ),
    React.createElement(
      Card,
      { className: 'p-4 space-y-4' },
      React.createElement(Input, {
        placeholder: 'Search articles...',
        value: search,
        onChange: (e) => setSearch(e.target.value),
      }),
      loading
        ? React.createElement('div', null, 'Loading...')
        : React.createElement(
            'table',
            { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement(
              'thead',
              { className: 'bg-gray-50' },
              React.createElement(
                'tr',
                null,
                React.createElement(
                  'th',
                  {
                    className:
                      'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  },
                  'Title',
                ),
                React.createElement(
                  'th',
                  {
                    className:
                      'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  },
                  'Updated',
                ),
                React.createElement('th', { className: 'px-4 py-2' }),
              ),
            ),
            React.createElement(
              'tbody',
              { className: 'bg-white divide-y divide-gray-200' },
              articles.map((a) =>
                React.createElement(
                  'tr',
                  { key: a.id, className: 'hover:bg-gray-50' },
                  React.createElement(
                    'td',
                    { className: 'px-4 py-2 whitespace-nowrap' },
                    React.createElement(
                      Link,
                      { to: `/knowledge/${a.slug}`, className: 'text-primary-600 hover:underline' },
                      a.title,
                    ),
                    a.verifiedSolution &&
                      React.createElement(
                        'span',
                        {
                          className:
                            'ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800',
                        },
                        'Verified',
                      ),
                  ),
                  React.createElement(
                    'td',
                    { className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-500' },
                    new Date(a.updatedAt).toLocaleDateString(),
                  ),
                  React.createElement(
                    'td',
                    { className: 'px-4 py-2 text-right whitespace-nowrap' },
                    isEditor &&
                      React.createElement(
                        Button,
                        {
                          size: 'sm',
                          variant: 'secondary',
                          onClick: () => navigate(`/knowledge/${a.slug}/edit`),
                        },
                        'Edit',
                      ),
                  ),
                ),
              ),
            ),
          ),
    ),
  );
};
export default KnowledgeListPage;
