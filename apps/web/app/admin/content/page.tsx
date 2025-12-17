'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  readTime: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LandingPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: 'USE_CASE' | 'COMPARISON' | 'CUSTOM';
  content: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManagementPage() {
  const { getToken } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingLanding, setEditingLanding] = useState<LandingPage | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [showLandingForm, setShowLandingForm] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [blogsRes, pagesRes] = await Promise.all([
        fetchWithAuth('/content/blog-posts', { getToken }),
        fetchWithAuth('/content/landing-pages', { getToken }),
      ]);
      const blogs = await blogsRes.json();
      const pages = await pagesRes.json();
      setBlogPosts(blogs);
      setLandingPages(pages);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBlogPost = async (post: Partial<BlogPost>) => {
    try {
      if (editingBlog) {
        await fetchWithAuth(`/content/blog-posts/${editingBlog.id}`, {
          getToken,
          method: 'PUT',
          body: JSON.stringify(post),
        });
      } else {
        await fetchWithAuth('/content/blog-posts', {
          getToken,
          method: 'POST',
          body: JSON.stringify(post),
        });
      }
      await loadContent();
      setEditingBlog(null);
      setShowBlogForm(false);
    } catch (error) {
      console.error('Failed to save blog post:', error);
      alert('Failed to save blog post');
    }
  };

  const saveLandingPage = async (page: Partial<LandingPage>) => {
    try {
      if (editingLanding) {
        await fetchWithAuth(`/content/landing-pages/${editingLanding.id}`, {
          getToken,
          method: 'PUT',
          body: JSON.stringify(page),
        });
      } else {
        await fetchWithAuth('/content/landing-pages', {
          getToken,
          method: 'POST',
          body: JSON.stringify(page),
        });
      }
      await loadContent();
      setEditingLanding(null);
      setShowLandingForm(false);
    } catch (error) {
      console.error('Failed to save landing page:', error);
      alert('Failed to save landing page');
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await fetchWithAuth(`/content/blog-posts/${id}`, { getToken, method: 'DELETE' });
      await loadContent();
    } catch (error) {
      console.error('Failed to delete blog post:', error);
    }
  };

  const deleteLandingPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return;
    try {
      await fetchWithAuth(`/content/landing-pages/${id}`, { getToken, method: 'DELETE' });
      await loadContent();
    } catch (error) {
      console.error('Failed to delete landing page:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage blog posts and landing pages</p>
        </div>

        <Tabs defaultValue="blog" className="space-y-6">
          <TabsList>
            <TabsTrigger value="blog">Blog Posts ({blogPosts.length})</TabsTrigger>
            <TabsTrigger value="landing">Landing Pages ({landingPages.length})</TabsTrigger>
          </TabsList>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Blog Posts</h2>
              <Button onClick={() => { setShowBlogForm(true); setEditingBlog(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Blog Post
              </Button>
            </div>

            {showBlogForm && (
              <BlogPostForm
                post={editingBlog}
                onSave={saveBlogPost}
                onCancel={() => { setShowBlogForm(false); setEditingBlog(null); }}
              />
            )}

            <div className="grid gap-4">
              {blogPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{post.title}</CardTitle>
                        <CardDescription>
                          {post.slug} • {post.readTime} • {post.published ? '✅ Published' : '📝 Draft'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setEditingBlog(post); setShowBlogForm(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteBlogPost(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{post.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Landing Pages Tab */}
          <TabsContent value="landing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Landing Pages</h2>
              <Button onClick={() => { setShowLandingForm(true); setEditingLanding(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                New Landing Page
              </Button>
            </div>

            {showLandingForm && (
              <LandingPageForm
                page={editingLanding}
                onSave={saveLandingPage}
                onCancel={() => { setShowLandingForm(false); setEditingLanding(null); }}
              />
            )}

            <div className="grid gap-4">
              {landingPages.map((page) => (
                <Card key={page.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{page.title}</CardTitle>
                        <CardDescription>
                          {page.slug} • {page.type} • {page.published ? '✅ Published' : '📝 Draft'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.open(`/${page.slug}`, '_blank')}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setEditingLanding(page); setShowLandingForm(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteLandingPage(page.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{page.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BlogPostForm({ post, onSave, onCancel }: { post: BlogPost | null; onSave: (post: Partial<BlogPost>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    slug: post?.slug || '',
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    author: post?.author || 'ClipForge Team',
    readTime: post?.readTime || '5 min read',
    published: post?.published || false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post ? 'Edit Blog Post' : 'New Blog Post'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Slug</Label>
            <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="my-blog-post" />
          </div>
          <div>
            <Label>Read Time</Label>
            <Input value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: e.target.value })} placeholder="5 min read" />
          </div>
        </div>
        <div>
          <Label>Title</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Blog Post Title" />
        </div>
        <div>
          <Label>Excerpt</Label>
          <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Short description..." rows={2} />
        </div>
        <div>
          <Label>Content (Markdown/HTML)</Label>
          <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Full content..." rows={10} />
        </div>
        <div>
          <Label>Author</Label>
          <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="Author name" />
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} />
          <Label>Published</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LandingPageForm({ page, onSave, onCancel }: { page: LandingPage | null; onSave: (page: Partial<LandingPage>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    slug: page?.slug || '',
    title: page?.title || '',
    description: page?.description || '',
    type: page?.type || 'USE_CASE' as 'USE_CASE' | 'COMPARISON' | 'CUSTOM',
    content: page?.content || '{}',
    published: page?.published || false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{page ? 'Edit Landing Page' : 'New Landing Page'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Slug</Label>
            <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="for/youtube-creators" />
          </div>
          <div>
            <Label>Type</Label>
            <select
              className="w-full px-3 py-2 border rounded-md"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="USE_CASE">Use Case (/for/*)</option>
              <option value="COMPARISON">Comparison (/vs/*)</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>
        <div>
          <Label>Title</Label>
          <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Landing Page Title" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="SEO description..." rows={2} />
        </div>
        <div>
          <Label>Content (JSON)</Label>
          <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder='{"hero": {...}}' rows={10} />
        </div>
        <div className="flex items-center space-x-2">
          <Switch checked={formData.published} onCheckedChange={(checked) => setFormData({ ...formData, published: checked })} />
          <Label>Published</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
