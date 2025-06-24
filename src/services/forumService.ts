import api from '../api/api';

interface ForumPost {
    id: number;
    title: string;
    content: string;
    user_id: number;
    username: string;
    image_url?: string;
    reply_count: number;
    created_at: string;
    updated_at: string;
}

interface ForumReply {
    id: number;
    post_id: number;
    user_id: number;
    username: string;
    image_url?: string;
    content: string;
    created_at: string;
}

interface CreatePostDto {
    title: string;
    content: string;
}

interface CreateReplyDto {
    content: string;
}

export const forumService = {
    async getAllPosts(): Promise<ForumPost[]> {
        const response = await api.get('/forum.php');
        return response.data;
    },

    async createPost(postData: CreatePostDto): Promise<ForumPost> {
        const response = await api.post('/forum.php', postData);
        return response.data;
    },

    async getPostById(postId: number): Promise<ForumPost> {
        const response = await api.get(`/forum-post.php`, { 
            params: { id: postId }
        });
        return response.data;
    },

    async getRepliesByPost(postId: number): Promise<ForumReply[]> {
        const response = await api.get(`/forum-post.php`, { 
            params: { id: postId, replies: 1 }
        });
        return response.data;
    },    async createReply(postId: number, replyData: CreateReplyDto): Promise<ForumReply> {
        const response = await api.post(`/forum-post.php`, {
            ...replyData,
            post_id: postId
        });
        return response.data;
    },

    async deletePost(postId: number): Promise<void> {
        await api.delete(`/forum.php/${postId}`);
    }
};
