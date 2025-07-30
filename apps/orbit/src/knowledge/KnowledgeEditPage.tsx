import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKnowledgeArticle, getKnowledgeVersions, createKnowledgeArticle, createKnowledgeVersion } from '../lib/api';

const KnowledgeEditPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (slug) {
      setIsEdit(true);
      setLoading(true);
      getKnowledgeArticle(token, slug)
        .then(res => {
          setTitle(res.article.title);
          setContent(res.article.content);
          setTags(res.article.tags || []);
        })
        .catch(err => setError(err.message || 'Failed to load article'))
        .finally(() => setLoading(false));
    }
  }, [slug, token]);

  // RBAC check for admin/editor roles
  const userRoles = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('roles') || '[]') : [];
  const isEditor = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('kb_editor');
  if (!isEditor) {
    return <div className="p-8 text-center text-destructive">You do not have permission to edit or create articles.</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEdit && slug) {
        // Add new version
        await createKnowledgeVersion(token, slug, { content, tags });
      } else {
        // Create new article
        const res = await createKnowledgeArticle(token, { title, content, tags });
        navigate(`/knowledge/${res.article.slug}`);
        return;
      }
      navigate(`/knowledge/${slug}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">{isEdit ? 'Edit Article' : 'Create Article'}</h1>
      {error && <div className="mb-4 text-destructive">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={255}
            placeholder="Article title"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Content</label>
          <textarea
            className="w-full border rounded px-3 py-2 min-h-[200px]"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            placeholder="Article content"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Tags (comma separated)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={tags.join(', ')}
            onChange={e => setTags(e.target.value.split(',').map(t => t.trim()))}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Save Version' : 'Create Article'}
        </button>
      </form>
    </div>
  );
};

export default KnowledgeEditPage;
