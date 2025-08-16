import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Textarea } from '@heroui/react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
const KnowledgeEditPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userRoles = user?.roles || [];
  const isEditor =
    userRoles.includes('admin') ||
    userRoles.includes('superadmin') ||
    userRoles.includes('kb_editor');
  const [article, setArticle] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!slug;
  useEffect(() => {
    if (isEdit && slug) {
      api.getKnowledgeArticle(slug).then((a) => {
        setArticle(a);
        setTitle(a.title);
        setContent(a.content);
        setTags((a.tags || []).join(', '));
      });
    }
  }, [slug, isEdit]);
  if (!isEditor) {
    return React.createElement(
      'div',
      { className: 'p-8 text-center' },
      'You do not have permission to edit articles.',
    );
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && article) {
        await api.createKnowledgeVersion(article.id, { content });
        navigate(`/knowledge/${slug}`);
      } else {
        const newArticle = await api.createKnowledgeArticle({
          title,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        });
        navigate(`/knowledge/${newArticle.slug}`);
      }
    } finally {
      setLoading(false);
    }
  };
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'h1',
      { className: 'text-2xl font-bold text-gray-900' },
      isEdit ? 'Edit Article' : 'New Article',
    ),
    React.createElement(
      Card,
      { className: 'p-4' },
      React.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'space-y-4' },
        !isEdit &&
          React.createElement(Input, {
            label: 'Title',
            value: title,
            onChange: (e) => setTitle(e.target.value),
            required: true,
          }),
        React.createElement(Textarea, {
          label: 'Content',
          value: content,
          onChange: (e) => setContent(e.target.value),
          rows: 10,
          required: true,
        }),
        React.createElement(Input, {
          label: 'Tags (comma separated)',
          value: tags,
          onChange: (e) => setTags(e.target.value),
        }),
        React.createElement(
          'div',
          { className: 'pt-2' },
          React.createElement(
            Button,
            { variant: 'primary', type: 'submit', isLoading: loading },
            isEdit ? 'Save Version' : 'Create Article',
          ),
        ),
      ),
    ),
  );
};
export default KnowledgeEditPage;
