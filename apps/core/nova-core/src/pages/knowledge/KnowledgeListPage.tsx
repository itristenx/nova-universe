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
  const isEditor = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('kb_editor');

  useEffect(() => {
    loadArticles();
  }, [search]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeArticles({ search }); // TODO-LINT: move to async function
      setArticles(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        {isEditor && (
          <Button variant="primary" onClick={() => navigate('/knowledge/new')}>
            New Article
          </Button>
        )}
      </div>
      <Card className="p-4 space-y-4">
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link to={`/knowledge/${a.slug}`} className="text-primary-600 hover:underline">
                      {a.title}
                    </Link>
                    {a.verifiedSolution && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {isEditor && (
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/knowledge/${a.slug}/edit`)}>
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
