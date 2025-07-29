import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';
import type { KnowledgeArticle } from '@/types';

export const KnowledgeBasePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);

  useEffect(() => {
    api.getKBArticles().then(setArticles).catch(() => setArticles([]));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Knowledge Base</h1>
      {articles.map(a => (
        <Card key={a.id} className="p-4">
          <h2 className="font-semibold">{a.title}</h2>
          <p className="text-sm text-gray-500">{a.kbId}</p>
        </Card>
      ))}
      {articles.length === 0 && <p>No articles found.</p>}
    </div>
  );
};

export default KnowledgeBasePage;
