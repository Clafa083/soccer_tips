import { config } from '../config/config';
import { SpecialBet, UserSpecialBet, CreateSpecialBetDto, CreateUserSpecialBetDto } from '../types/models';

class SpecialBetService {    private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
        
        // Add token as query parameter like the main api.ts does
        if (token) {
            const urlObj = new URL(url);
            urlObj.searchParams.set('token', token);
            url = urlObj.toString();
        }
        
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }), // Keep header as fallback
                ...options.headers,
            },
        });
    }

    async getSpecialBets(): Promise<SpecialBet[]> {
        const response = await this.fetchWithAuth(`${config.API_URL}/special-bets.php`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }    async createSpecialBet(data: CreateSpecialBetDto): Promise<SpecialBet> {
        const token = localStorage.getItem('token');
        
        // Add token to the data payload as fallback
        const payload = token ? { ...data, token } : data;
        
        const response = await this.fetchWithAuth(`${config.API_URL}/special-bets.php`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }    async updateSpecialBet(id: number, data: Partial<CreateSpecialBetDto>): Promise<SpecialBet> {
        const token = localStorage.getItem('token');
        
        // Add token to the data payload as fallback
        const payload = token ? { ...data, token } : data;
        
        // Try PUT first, then fallback to POST with _method=PUT
        let response: Response;
        try {
            response = await this.fetchWithAuth(`${config.API_URL}/special-bets.php?id=${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.log('PUT failed, trying POST with _method=PUT fallback');
            // Fallback to POST with _method=PUT
            response = await this.fetchWithAuth(`${config.API_URL}/special-bets.php?id=${id}&_method=PUT`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }    async deleteSpecialBet(id: number): Promise<void> {
        // Try DELETE first, then fallback to POST with _method=DELETE
        let response: Response;
        try {
            response = await this.fetchWithAuth(`${config.API_URL}/special-bets.php?id=${id}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.log('DELETE failed, trying POST with _method=DELETE fallback');
            // Fallback to POST with _method=DELETE
            response = await this.fetchWithAuth(`${config.API_URL}/special-bets.php?id=${id}&_method=DELETE`, {
                method: 'POST',
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }
    }

    async getUserSpecialBets(userId: number): Promise<UserSpecialBet[]> {
        const response = await this.fetchWithAuth(`${config.API_URL}/user-special-bets.php?user_id=${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }    async createOrUpdateUserSpecialBet(data: CreateUserSpecialBetDto): Promise<UserSpecialBet> {
        const token = localStorage.getItem('token');
        
        // Add token to the data payload as fallback
        const payload = token ? { ...data, token } : data;
        
        const response = await this.fetchWithAuth(`${config.API_URL}/user-special-bets.php`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
}

export const specialBetService = new SpecialBetService();
