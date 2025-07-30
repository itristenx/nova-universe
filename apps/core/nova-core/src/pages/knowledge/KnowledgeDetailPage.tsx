import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Textarea } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { KnowledgeArticle, KnowledgeArticleVersion } from '@/types';

const KnowledgeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isEditor = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('kb_editor');

  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [versions, setVersions] = useState<KnowledgeArticleVersion[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        setLoading(true);
        const art = await api.getKnowledgeArticle(slug);
        setArticle(art);
        if (art) {
          const vers = await api.getKnowledgeVersions(art.id);
          setVersions(vers || []);
          const com = await api.getKnowledgeComments(art.id);
          setComments(com || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const addComment = () => {
    if (!comment.trim() || !user || !article) return;
    const newComment = {
      id: Date.now(),
      user: { id: user.id, name: user.name },
      content: comment,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    setComment('');
  };


  if (loading) return <div>Loading...</div>;
  if (!article) return <div>Article not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {article.title}
          {article.verifiedSolution && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Verified
            </span>
          )}
        </h1>
        {isEditor && (
          <Button variant="secondary" onClick={() => navigate(`/knowledge/${slug}/edit`)}>
            Edit
          </Button>
        )}
      </div>

      <Card className="p-4 space-y-4">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </Card>

      {versions.length > 0 && (
        <Card className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Version History</h2>
          <ul className="list-disc pl-4 text-sm">
            {versions.map(v => (
              <li key={v.id}>
                v{v.version} • {v.author?.name} • {new Date(v.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
        {comments.map(c => (
          <div key={c.id} className="border-b py-2 text-sm">
            <div className="text-gray-600 mb-1">{c.user?.name} • {new Date(c.createdAt).toLocaleString()}</div>
            <div>{c.content}</div>
          </div>
        ))}

        {user && (
          <div className="space-y-2">
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment" />
            <Button variant="primary" onClick={addComment} disabled={!comment.trim()}>
              Post Comment
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default KnowledgeDetailPage;
