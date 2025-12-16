import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - ClipForge',
  description: 'Tips, tutorials, and insights on video repurposing, AI content creation, and social media growth.',
};

export default function BlogPage() {
  const posts = [
    {
      slug: 'welcome-to-clipforge',
      title: 'Welcome to ClipForge: AI-Powered Video Repurposing',
      excerpt: 'Discover how ClipForge helps creators turn long-form content into viral social media clips with AI.',
      date: 'December 17, 2025',
      readTime: '5 min read',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ClipForge Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, tutorials, and insights on video repurposing, AI content creation, and social media growth.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-4 text-purple-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                  Read more →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-purple-50 rounded-lg px-6 py-4">
            <p className="text-gray-600">
              More articles coming soon! Follow us on{' '}
              <a href="https://twitter.com/clipforge" className="text-purple-600 hover:underline">
                Twitter
              </a>{' '}
              for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
