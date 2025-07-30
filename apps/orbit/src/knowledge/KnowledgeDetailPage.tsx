import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getKnowledgeArticle, getKnowledgeVersions, getKnowledgeComments } from '../lib/api';

const KnowledgeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  const userRoles = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('roles') || '[]') : [];
  const isEditor = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('kb_editor');
  const isAuthenticated = !!token;
  const [article, setArticle] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await getKnowledgeArticle(token, slug!);
        setArticle(res.article);
        const vRes = await getKnowledgeVersions(token, res.article.id);
        setVersions(vRes.versions || []);
        const cRes = await getKnowledgeComments(token, res.article.id);
        setComments(cRes.comments || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug, token]);

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    setError(null);
    try {
      // TODO: Call API to add comment
      setComments([...comments, { id: Date.now(), user: { name: 'You' }, content: commentText, createdAt: new Date().toISOString() }]);
      setCommentText('');
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!article) return <div className="p-8 text-center">Article not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <div className="mb-4 text-muted-foreground">By {article.createdBy?.name} • {new Date(article.createdAt).toLocaleString()}</div>
      <div className="prose mb-8">{article.content}</div>
      {isEditor && (
        <div className="mb-4 flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate(`/knowledge/${slug}/edit`)}>Edit</button>
          <button className="btn btn-outline" onClick={() => navigate(`/knowledge/${slug}/versions`)}>View Versions</button>
        </div>
      )}
      <h2 className="text-lg font-semibold mt-8 mb-2">Version History</h2>
      <ul className="mb-8">
        {versions.map(v => (
          <li key={v.id} className="text-sm">
            v{v.version}: {v.author?.name} • {new Date(v.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
      <h2 className="text-lg font-semibold mb-2">Comments</h2>
      <ul>
        {comments.map(c => (
          <li key={c.id} className="mb-2 border-b pb-2">
            <div className="text-sm text-muted-foreground">{c.user?.name} • {new Date(c.createdAt).toLocaleString()}</div>
            <div>{c.content}</div>
          </li>
        ))}
      </ul>
      {isAuthenticated && (
        <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={commentLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={commentLoading || !commentText.trim()}>
            {commentLoading ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}
    </div>
  );
};

export default KnowledgeDetailPage;
