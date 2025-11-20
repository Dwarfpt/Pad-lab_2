import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { blogService } from '../../services/blogService';

export default function Blog() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: ['blog-posts', page, selectedCategory],
    queryFn: () => blogService.getAllPosts(page, selectedCategory),
    keepPreviousData: true,
  });

  const categories = [
    { id: undefined, label: t('blog.categories.all') },
    { id: 'Technology', label: t('blog.categories.technology') },
    { id: 'Tips & Tricks', label: t('blog.categories.tips') },
    { id: 'Environment', label: t('blog.categories.environment') },
    { id: 'Business', label: t('blog.categories.business') },
    { id: 'Security', label: 'Security' },
    { id: 'EV Charging', label: 'EV Charging' },
  ];

  const handleCategoryClick = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">{t('blog.title')}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-100">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-full transition text-sm font-medium cursor-pointer relative z-10 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-primary-600 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-primary-600" size={48} />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-20 text-red-500">
              <AlertCircle className="mr-2" />
              <span>{t('common.error')}</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data?.posts?.map((post: any) => (
                  <Card key={post._id} hover className="flex flex-col">
                    <img
                      src={post.featuredImage || 'https://via.placeholder.com/600x400'}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                          {post.category}
                        </span>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <CardTitle className="text-xl mb-3 line-clamp-2">
                        {post.title}
                      </CardTitle>

                      <CardContent className="flex-1 mb-4 line-clamp-3">
                        {post.excerpt}
                      </CardContent>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center text-sm text-gray-600">
                          <User size={16} className="mr-2" />
                          {post.author?.name || 'Admin'}
                        </div>
                        <Link 
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border-2 border-primary-600 text-primary-600 hover:bg-primary-50 transition-colors no-underline"
                        >
                          {t('blog.readMore')}
                          <ArrowRight size={16} className="ml-2" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data?.pagination && (
                <div className="flex justify-center mt-12 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Page {page} of {data.pagination.pages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page === data.pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">{t('common.newsletter.title')}</h2>
            <p className="text-gray-600 mb-8">
              {t('common.newsletter.subtitle')}
            </p>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder={t('common.newsletter.placeholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button 
                variant="primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Subscribe clicked');
                }}
              >
                {t('common.newsletter.subscribe')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
