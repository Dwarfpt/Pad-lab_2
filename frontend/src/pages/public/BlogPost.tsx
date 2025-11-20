import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Loader, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { blogService } from '../../services/blogService';

export default function BlogPost() {
  const { id: slug } = useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getPostBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        <AlertCircle className="mr-2" />
        <span>Error loading post</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full font-medium">
                  {post.category}
                </span>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  {post.author?.name || 'Admin'}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {post.title}
              </h1>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </header>

            {/* Featured Image */}
            <img
              src={post.featuredImage || 'https://via.placeholder.com/1200x600'}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />

            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related Posts - Placeholder for now as API might not return related posts yet */}
      {/* <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} hover>
                  <Link to={`/blog/${relatedPost.id}`}>
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
