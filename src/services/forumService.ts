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
        console.log('🔵 ForumService: Starting getAllPosts()');
        console.log('🔵 API_BASE_URL:', API_BASE_URL);
        
        try {
            const url = `${API_BASE_URL}/api/forum`;
            console.log('🔵 Making request to:', url);
            
            const response = await fetch(url);
            console.log('🔵 Response status:', response.status);
            console.log('🔵 Response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response not ok. Status:', response.status, 'Error:', errorText);
                throw new Error(`Failed to fetch forum posts: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log('✅ Successfully fetched forum posts:', data);
            return data;
        } catch (error) {
            console.error('❌ Error in getAllPosts:', error);
            throw error;
        }
    },async createPost(content: string): Promise<ForumPost> {
        console.log('🔵 ForumService: Creating post...');
        console.log('Content:', content);
        
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token ? 'Found token (length: ' + token.length + ')' : 'No token found');
        
        const url = `${API_BASE_URL}/api/forum`;
        console.log('Request URL:', url);
        
        const requestBody = { content };
        console.log('Request body:', requestBody);
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('Request headers:', headers);

        console.log('🔵 ForumService: Sending fetch request...');
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        console.log('🔵 ForumService: Response received');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            console.log('❌ ForumService: Response not ok, getting error details...');
            let errorData;
            try {
                errorData = await response.json();
                console.log('Error data from response:', errorData);
            } catch (jsonError) {
                console.log('Could not parse error as JSON:', jsonError);
                errorData = { error: 'Unknown error' };
            }
            throw new Error(errorData.error || 'Failed to create forum post');
        }

        console.log('✅ ForumService: Success! Parsing response...');
        const result = await response.json();
        console.log('Response data:', result);
        return result;
    },    async deletePost(postId: number): Promise<void> {
        const token = localStorage.getItem('token');
        
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
