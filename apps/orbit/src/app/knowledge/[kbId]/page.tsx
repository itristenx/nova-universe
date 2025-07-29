"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getKBArticle } from "../../../lib/api";

export default function ArticlePage() {
  const { kbId } = useParams() as { kbId: string };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "demo-token" : "";
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKBArticle(token, kbId)
      .then(res => { if (res.success) setArticle(res.article); })
      .finally(() => setLoading(false));
  }, [kbId, token]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!article) return <div className="p-8 text-center">Article not found.</div>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <div className="text-sm text-muted-foreground mb-4">{article.kbId}</div>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </main>
  );
}
