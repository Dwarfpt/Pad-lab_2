import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { blogService } from '../../services/blogService';

interface BlogForm {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
}

export default function BlogManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [submitAction, setSubmitAction] = useState<'publish' | 'draft'>('publish');
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlogForm>();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: blogService.getAdminPosts,
  });

  const createMutation = useMutation({
    mutationFn: blogService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Статья создана успешно');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Ошибка создания статьи');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      blogService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Статья обновлена успешно');
      setIsModalOpen(false);
      setEditingPost(null);
      reset();
    },
    onError: () => {
      toast.error('Ошибка обновления статьи');
    },
  });

  // ...existing code...

  const onSubmit = (data: BlogForm) => {
    const isPublished = submitAction === 'publish';
    const postData = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category,
      featuredImage: data.image,
      isPublished,
    };

    if (editingPost) {
      // If we are updating, we might want to preserve the current published state 
      // unless explicitly changing it via buttons. 
      // But here the buttons are "Save as Draft" and "Update/Publish".
      // "Save as Draft" -> isPublished: false
      // "Update/Publish" -> isPublished: true (if it was draft) or keep true (if it was published)
      
      // Logic refinement:
      // If submitAction is 'draft', force isPublished = false.
      // If submitAction is 'publish', force isPublished = true.
      updateMutation.mutate({ id: editingPost._id, data: postData });
    } else {
      createMutation.mutate(postData);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    reset({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      image: post.featuredImage,
    });
    setIsModalOpen(true);
  };

  const publishMutation = useMutation({
    mutationFn: blogService.publishPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Статья опубликована');
    },
    onError: () => {
      toast.error('Ошибка публикации статьи');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: blogService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Статья удалена успешно');
    },
    onError: () => {
      toast.error('Ошибка удаления статьи');
    },
  });

  const posts = postsData?.posts || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-1">Create and manage blog posts</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingPost(null);
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-gray-600 text-sm mb-1">Всего статей</p>
          <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm mb-1">Опубликовано</p>
          <p className="text-3xl font-bold text-green-600">
            {posts.filter((p: any) => p.isPublished).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm mb-1">Черновики</p>
          <p className="text-3xl font-bold text-orange-600">
            {posts.filter((p: any) => !p.isPublished).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 text-sm mb-1">Всего просмотров</p>
          <p className="text-3xl font-bold text-blue-600">
            {posts.reduce((sum: number, p: any) => sum + p.views, 0)}
          </p>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map((post: any) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{post.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {post.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof post.author === 'object' 
                      ? `${post.author.firstName} ${post.author.lastName}`
                      : post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        post.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Eye size={16} className="mr-2 text-gray-400" />
                      {post.views}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this post?')) {
                            deleteMutation.mutate(post._id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingPost ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPost(null);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <Input
                label="Title"
                placeholder="Post title"
                error={errors.title?.message}
                {...register('title', { required: 'Title is required' })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Category"
                  placeholder="Technology"
                  error={errors.category?.message}
                  {...register('category', { required: 'Category is required' })}
                />

                <Input
                  label="Featured Image URL"
                  placeholder="https://..."
                  error={errors.image?.message}
                  {...register('image')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  {...register('excerpt', { required: 'Excerpt is required' })}
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  rows={12}
                  placeholder="Write your content here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  {...register('content', { required: 'Content is required' })}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSubmitAction('draft')}
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => setSubmitAction('publish')}
                >
                  {editingPost ? 'Update' : 'Publish'} Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
