export interface ForumPost {
    id: number;
    userId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        email: string;
        imageUrl?: string;
        isAdmin: boolean;
    };
}

export interface CreateForumPostRequest {
    content: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const forumService = {
    async getAllPosts(): Promise<ForumPost[]> {
        const response = await fetch(`${API_BASE_URL}/api/forum`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch forum posts');
        }
        
        return response.json();
    },

    async createPost(content: string): Promise<ForumPost> {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/api/forum`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create forum post');
        }

        return response.json();
    },

    async deletePost(postId: number): Promise<void> {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch(`${API_BASE_URL}/api/forum/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete forum post');
        }
    }
};
