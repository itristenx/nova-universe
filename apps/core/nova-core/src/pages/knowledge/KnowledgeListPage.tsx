import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { KnowledgeArticle } from '@/types';

const KnowledgeListPage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        {isEditor && (
          <Button variant="primary" onClick={() => navigate('/knowledge/new')}>
            New Article
          </Button>
        )}
      </div>
      <Card className="space-y-4 p-4">
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Updated
                </th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link to={`/knowledge/${a.slug}`} className="text-primary-600 hover:underline">
                      {a.title}
                    </Link>
                    {a.verifiedSolution && (
                      <span className="ml-2 inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap text-gray-500">
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {isEditor && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/knowledge/${a.slug}/edit`)}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default KnowledgeListPage;
