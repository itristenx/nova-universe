import React, { useState } from 'react';
import {
  Save,
  Eye,
  Code,
  Image,
  Link,
  List,
  ListOrdered,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table,
  CheckSquare,
  FileText,
  Upload,
  X,
  Tag,
  Users,
  Clock,
  Send,
  Archive,
  MoreVertical,
  ChevronDown,
} from 'lucide-react';

// Types
interface ArticleMetadata {
  title: string;
  category: string;
  tags: string[];
  status: 'draft' | 'review' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  visibility: 'public' | 'internal' | 'restricted';
  approvers: string[];
  templateId?: string;
}

interface ArticleVersion {
  id: string;
  version: number;
  content: string;
  createdAt: string;
  author: string;
  changes: string;
}

const ArticleEditorPage: React.FC = () => {
  // State
  const [content, setContent] = useState('# Getting Started\n\nStart writing your knowledge article here...\n\n## Overview\n\nProvide a brief overview of the topic.\n\n## Prerequisites\n\n- Requirement 1\n- Requirement 2\n\n## Step-by-Step Guide\n\n1. First step\n2. Second step\n3. Third step\n\n## Troubleshooting\n\n### Common Issues\n\n**Problem**: Description of the problem\n**Solution**: How to fix it\n\n## Related Articles\n\n- [Related Article 1](#)\n- [Related Article 2](#)');
  const [metadata, setMetadata] = useState<ArticleMetadata>({
    title: 'Untitled Article',
    category: 'General',
    tags: [],
    status: 'draft',
    author: {
      id: 'user-1',
      name: 'John Doe',
      avatar: 'JD',
    },
    visibility: 'public',
    approvers: [],
  });
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [showMetadata, setShowMetadata] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; size: string; type: string }>>([]);

  // Sample data
  const categories = ['Getting Started', 'IT Support', 'HR Services', 'Facilities', 'Security', 'General'];
  const templates = [
    { id: 't1', name: 'How-To Guide', icon: '📝' },
    { id: 't2', name: 'Troubleshooting', icon: '🔧' },
    { id: 't3', name: 'FAQ', icon: '❓' },
    { id: 't4', name: 'Policy Document', icon: '📋' },
  ];

  // Markdown helpers
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter((t) => t !== tag),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        id: Math.random().toString(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type,
      }));
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview (in production, use a proper markdown library like react-markdown)
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/\n/gim, '<br />');
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1"
              placeholder="Article Title"
            />
            <span
              className={`rounded-lg px-3 py-1 text-sm font-medium ${
                metadata.status === 'published'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : metadata.status === 'review'
                    ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                    : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              {metadata.status.charAt(0).toUpperCase() + metadata.status.slice(1)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="flex items-center gap-2 rounded-lg bg-white/70 px-4 py-2 transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
            >
              <Tag className="h-4 w-4" />
              Metadata
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-white/70 px-4 py-2 transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800">
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700">
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 font-medium text-white transition-all hover:shadow-lg">
              <Send className="h-4 w-4" />
              Publish
            </button>
            <button className="rounded-lg bg-white/70 p-2 transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div className="border-b border-gray-200 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
          <div className="grid grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-white/70 px-4 py-2 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="mb-2 block text-sm font-medium">Visibility</label>
              <select
                value={metadata.visibility}
                onChange={(e) => setMetadata({ ...metadata, visibility: e.target.value as any })}
                className="w-full rounded-lg border border-gray-200 bg-white/70 px-4 py-2 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70"
              >
                <option value="public">Public</option>
                <option value="internal">Internal Only</option>
                <option value="restricted">Restricted</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select
                value={metadata.status}
                onChange={(e) => setMetadata({ ...metadata, status: e.target.value as any })}
                className="w-full rounded-lg border border-gray-200 bg-white/70 px-4 py-2 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70"
              >
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Tags */}
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add tags..."
                  className="flex-1 rounded-lg border border-gray-200 bg-white/70 px-4 py-2 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70"
                />
                <button
                  onClick={addTag}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-600 dark:text-blue-400"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-blue-800">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div>
              <label className="mb-2 block text-sm font-medium">Template</label>
              <select className="w-full rounded-lg border border-gray-200 bg-white/70 px-4 py-2 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
                <option value="">None</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.icon} {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white/70 p-3 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-center gap-2">
          {/* View Mode */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
            <button
              onClick={() => setViewMode('edit')}
              className={`rounded-lg px-3 py-1 text-sm transition-all ${
                viewMode === 'edit'
                  ? 'bg-white text-blue-600 shadow dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Code className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`rounded-lg px-3 py-1 text-sm transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`rounded-lg px-3 py-1 text-sm transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow dark:bg-gray-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              }`}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* Format buttons */}
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n# ', '\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n## ', '\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n### ', '\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          <button
            onClick={() => insertMarkdown('\n- ', '\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n1. ', '\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n> ', '\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('[', '](url)')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Link"
          >
            <Link className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('![alt text](', ')')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Image"
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            onClick={() => insertMarkdown('\n```\n', '\n```\n')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

          {/* File upload */}
          <label className="cursor-pointer rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Upload className="h-4 w-4" />
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>

          {/* Word count */}
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
            {content.split(/\s+/).filter(Boolean).length} words • {content.length} characters
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Edit View */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col ${viewMode === 'split' ? 'w-1/2 border-r border-gray-200 dark:border-gray-700' : 'w-full'}`}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 resize-none bg-white/70 p-6 font-mono text-sm backdrop-blur-xl focus:outline-none dark:bg-gray-800/70"
              placeholder="Start writing your article in Markdown..."
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`overflow-y-auto ${viewMode === 'split' ? 'w-1/2' : 'w-full'} bg-white/70 p-6 backdrop-blur-xl dark:bg-gray-800/70`}>
            <div
              className="prose prose-blue max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="mb-4 text-lg font-semibold">Attachments ({attachments.length})</h3>
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-500">{file.size}</div>
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-700">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 bg-white/70 p-2 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Last saved: 2 minutes ago</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Version 3</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>Markdown Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditorPage;
