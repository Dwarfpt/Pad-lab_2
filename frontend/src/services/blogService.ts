import api from './api';

export interface BlogPostData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  featuredImage?: string;
}

export const blogService = {
  getAllPosts: async (page = 1, category?: string) => {
    const response = await api.get('/blog', {
      params: { page, category },
    });
    return response.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await api.get(`/blog/${slug}`);
    return response.data;
  },

  getAdminPosts: async () => {
    const response = await api.get('/blog/admin/all');
    return response.data;
  },

  createPost: async (data: BlogPostData) => {
    const response = await api.post('/blog', data);
    return response.data;
  },

  updatePost: async (id: string, data: Partial<BlogPostData>) => {
    const response = await api.put(`/blog/${id}`, data);
    return response.data;
  },

  publishPost: async (id: string) => {
    const response = await api.put(`/blog/${id}/publish`);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/blog/${id}`);
    return response.data;
  },
};
