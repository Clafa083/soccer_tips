import api from '../api/api';
import { SiteContent, CreateSiteContentDto, UpdateSiteContentDto } from '../types/models';

export const siteContentService = {
    // Get all site content
    getAllContent: async (): Promise<SiteContent[]> => {
        const response = await api.get('/site-content.php');
        return response.data;
    },

    // Get content by key
    getContentByKey: async (key: string): Promise<SiteContent> => {
        const response = await api.get(`/site-content.php?key=${key}`);
        return response.data;
    },

    // Update content (admin only)
    updateContent: async (key: string, data: UpdateSiteContentDto): Promise<SiteContent> => {
        const response = await api.put(`/site-content.php?key=${key}`, data);
        return response.data;
    },

    // Create new content (admin only)
    createContent: async (data: CreateSiteContentDto): Promise<SiteContent> => {
        const response = await api.post('/site-content.php', data);
        return response.data;
    },

    // Delete content (admin only)
    deleteContent: async (key: string): Promise<void> => {
        await api.delete(`/site-content.php?key=${key}`);
    }
};
