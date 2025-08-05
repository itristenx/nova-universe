import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Textarea } from '@heroui/react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
const KnowledgeDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const userRoles = user?.roles || [];
    const isEditor = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('kb_editor');
    const [article, setArticle] = useState(null);
    const [versions, setVersions] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    useEffect(() => {
        if (!slug)
            return;
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
            }
            finally {
                setLoading(false);
            }
        }
        load();
    }, [slug]);
    const addComment = async () => {
        if (!comment.trim() || !user || !article)
            return;
        const newComment = await api.addKnowledgeComment(article.id, { content: comment });
        setComments([...comments, newComment]);
        setComment('');
    };
    if (loading)
        return React.createElement("div", null, "Loading...");
    if (!article)
        return React.createElement("div", null, "Article not found.");
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("h1", { className: "text-2xl font-bold text-gray-900" },
                article.title,
                article.verifiedSolution && (React.createElement("span", { className: "ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" }, "Verified"))),
            isEditor && (React.createElement(Button, { variant: "secondary", onClick: () => navigate(`/knowledge/${slug}/edit`) }, "Edit"))),
        React.createElement(Card, { className: "p-4 space-y-4" },
            React.createElement("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(article.content) } })),
        versions.length > 0 && (React.createElement(Card, { className: "p-4 space-y-2" },
            React.createElement("h2", { className: "text-lg font-semibold" }, "Version History"),
            React.createElement("ul", { className: "list-disc pl-4 text-sm" }, versions.map(v => (React.createElement("li", { key: v.id },
                "v",
                v.version,
                " \u2022 ",
                v.author?.name,
                " \u2022 ",
                new Date(v.createdAt).toLocaleDateString())))))),
        React.createElement(Card, { className: "p-4 space-y-4" },
            React.createElement("h2", { className: "text-lg font-semibold" }, "Comments"),
            comments.length === 0 && React.createElement("div", { className: "text-sm text-gray-500" }, "No comments yet."),
            comments.map(c => (React.createElement("div", { key: c.id, className: "border-b py-2 text-sm" },
                React.createElement("div", { className: "text-gray-600 mb-1" },
                    c.user?.name,
                    " \u2022 ",
                    new Date(c.createdAt).toLocaleString()),
                React.createElement("div", null, c.content)))),
            user && (React.createElement("div", { className: "space-y-2" },
                React.createElement(Textarea, { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Add a comment" }),
                React.createElement(Button, { variant: "primary", onClick: addComment, disabled: !comment.trim() }, "Post Comment"))))));
};
export default KnowledgeDetailPage;
