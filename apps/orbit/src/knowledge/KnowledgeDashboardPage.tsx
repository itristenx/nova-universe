import React, { useEffect, useState } from 'react';
import { getKnowledgeArticles, deleteKnowledgeArticle } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const KnowledgeDashboardPage: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const userRoles =
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('roles') || '[]') : [];
  const isEditor =
    userRoles.includes('admin') ||
    userRoles.includes('superadmin') ||
    userRoles.includes('kb_editor');

  useEffect(() => {
    if (!isEditor) return;
    setLoading(true);
    getKnowledgeArticles(token, { search })
      .then((res) => setArticles(res.articles || []))
      .catch((err) => setError(err.message || 'Failed to load articles'))
      .finally(() => setLoading(false));
  }, [search]);

  if (!isEditor) {
    return (
      <div className="text-destructive p-8 text-center">
        You do not have permission to manage articles.
      </div>
    );
  }

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    setLoading(true);
    try {
      await deleteKnowledgeArticle(token, slug);
      setArticles(articles.filter((a) => a.slug !== slug));
    } catch (err: any) {
      setError(err.message || 'Failed to delete article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Knowledge Base Management</h1>
      <div className="mb-4 flex gap-2">
        <input
          className="flex-1 rounded border px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
        />
        <button className="btn btn-primary" onClick={() => navigate('/knowledge/new')}>
          New Article
        </button>
      </div>
      {error && <div className="text-destructive mb-4">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Title</th>
              <th className="border px-2 py-1">Slug</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td className="border px-2 py-1">{article.title}</td>
                <td className="border px-2 py-1">{article.slug}</td>
                <td className="flex gap-2 border px-2 py-1">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/knowledge/${article.slug}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/knowledge/${article.slug}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-destructive"
                    onClick={() => handleDelete(article.slug)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default KnowledgeDashboardPage;
