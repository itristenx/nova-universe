import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { KnowledgeArticle } from '@/types';

const KnowledgeEditPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isEditor = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('kb_editor');

  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!slug;

  useEffect(() => {
    if (isEdit && slug) {
      api.getKnowledgeArticle(slug).then(a => {
        setArticle(a);
        setTitle(a.title);
        setContent(a.content);
        setTags((a.tags || []).join(', '));
      });
    }
  }, [slug, isEdit]);

  if (!isEditor) {
    return <div className="p-8 text-center">You do not have permission to edit articles.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && article) {
        await api.createKnowledgeVersion(article.id, { content }); // TODO-LINT: move to async function
        navigate(`/knowledge/${slug}`);
      } else {
        const newArticle = await api.createKnowledgeArticle({ title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }); // TODO-LINT: move to async function
        navigate(`/knowledge/${newArticle.slug}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Article' : 'New Article'}</h1>
      <Card className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          )}
          <Textarea label="Content" value={content} onChange={e => setContent(e.target.value)} rows={10} required />
          <Input label="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          <div className="pt-2">
            <Button variant="primary" type="submit" isLoading={loading}>
              {isEdit ? 'Save Version' : 'Create Article'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default KnowledgeEditPage;
